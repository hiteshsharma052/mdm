// 
// FILE NAME : facets.js 
// 

const pendingRequests = new Map();

// Mapping of filter types to their respective element IDs and display names
const facetConfig = {
    'country': {
        elementId: 'collapseFacet-country',
        displayName: 'Country',
        type: 'search'
    },
    'item_category': {
        elementId: 'collapseFacet-Catalogue',
        displayName: 'Item Category',
        type: 'search'
    },
    'sub_category': {
        elementId: 'collapseFacet-Scope',
        displayName: 'Sub Category',
        type: 'search'
    },
    'item_name': {
        elementId: 'collapseFacet-itemname',
        displayName: 'Item Name',
        type: 'search'
    },
    'item_code': {
        elementId: 'collapseFacet-itemid',
        displayName: 'Item Code',
        type: 'search'
    },
    'item_description': {
        elementId: 'collapseFacet-itemdesc',
        displayName: 'Item Description',
        type: 'search'
    },
    'organization': {
        elementId: 'collapseFacet-orgcode',
        displayName: 'Organization Code',
        type: 'search'
    },
    'brand': {
        elementId: 'collapseFacet-kind',
        displayName: 'Brand',
        type: 'search'
    },
    'item_status': {
        elementId: 'collapseFacet-status',
        displayName: 'Status',
        type: 'checkbox'
    },
    'invoice_flag': {
        elementId: 'collapseFacet-invoice_enabled',
        displayName: 'Invoice Enabled',
        type: 'checkbox'
    }
};

// Add a reverse mapping function to get filter type from element ID
const getFilterTypeFromElementId = (elementId) => {
    return Object.entries(facetConfig).find(([_, config]) => 
        config.elementId === elementId
    )?.[0] || null;
};

// Function to render search results in facet panel
const renderFacetSearchResults = (elementId, data) => {
    const panel = document.querySelector(`#${elementId} .filter-acc-panel`);
    const paginationContainer = document.querySelector(`#${elementId} .pagination-container`);
    if (!panel) return;

    const filterType = getFilterTypeFromElementId(elementId);
    if (!filterType) return;

    // Preserve search input value
    const searchInput = document.querySelector(`#${elementId} input[type="search"]`);
    const currentSearch = searchInput ? searchInput.value : '';

    // Check if we have valid data
    if (!data?.items?.length) {
        panel.innerHTML = '<div class="tx-center mg-t-10">No filters found...</div>';
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Render valid items with checked state from searchState.facets
    let html = '';
    data.items.forEach(item => {
        if (!item.value || !item.label) return;
        
        const isChecked = searchState.facets[filterType]?.includes(item.value) || false;
        html += `
            <div class="d-flex align-items-center justify-content-between pd-y-5">
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" 
                           id="${item.value}" 
                           ${isChecked ? 'checked' : ''}>
                    <label class="custom-control-label" for="${item.value}">
                        ${item.label}
                    </label>
                </div>
            </div>
        `;
    });

    if (!html) {
        panel.innerHTML = '<div class="tx-center mg-t-10">No filters found</div>';
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    panel.innerHTML = html;

    // Update pagination handlers to include facet search
    if (data.total_pages > 1) {
        let paginationHtml = `
            <div class="d-flex justify-content-between align-items-center align-items-baseline">
                <small class="text-muted">Page ${data.current_page} of ${data.total_pages}</small>
                <ul class="pagination pagination-sm m-0">
                    <li class="page-item ${data.current_page === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${data.current_page - 1}">&laquo;</a>
                    </li>`;

        for (let i = Math.max(1, data.current_page - 2); i <= Math.min(data.total_pages, data.current_page + 2); i++) {
            paginationHtml += `
                <li class="page-item ${i === data.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`;
        }

        paginationHtml += `
                    <li class="page-item ${data.current_page === data.total_pages ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${data.current_page + 1}">&raquo;</a>
                    </li>
                </ul>
            </div>`;

        if (!paginationContainer) {
            panel.insertAdjacentHTML('afterend', `<div class="pagination-container">${paginationHtml}</div>`);
        } else {
            paginationContainer.innerHTML = paginationHtml;
        }

        // Add pagination click handlers with facet search
        document.querySelectorAll(`#${elementId} .page-link`).forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (!page || page < 1 || page > data.total_pages) return;
                
                const searchInput = document.querySelector(`#${elementId} input[type="search"]`);
                await fetchFacetData(filterType, page, searchInput?.value || '');
            });
        });
    }
};


// Function to fetch facet data for a specific filter type
// Updated fetchFacetData function with caching
const fetchFacetData = async (filterType, page = 1, facetSearch = '') => {
    // If there's already a pending request for this filter, don't make another
    if (pendingRequests.has(filterType)) {
        return;
    }

    const config = facetConfig[filterType];
    if (!config) return;

    // Check cache first
    const cachedData = FacetCache.get(filterType, page, facetSearch, searchState);
    if (cachedData) {
        renderFacetSearchResults(config.elementId, cachedData);
        return;
    }

    // Show loader
    FacetLoader.show(config.elementId);
    
    // Set pending request flag
    pendingRequests.set(filterType, true);

    try {
        const response = await fetch('/api/items/facets/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter_type: filterType,
                page: page,
                page_size: 5,
                search: searchState.search,
                search_column: searchState.search_column,
                facet_search: facetSearch
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data) {
            FacetCache.set(filterType, page, facetSearch, searchState, result.data);
            renderFacetSearchResults(config.elementId, result.data);
        }
    } catch (error) {
        console.error(`Error fetching facet data for ${filterType}:`, error);
        const panel = document.querySelector(`#${config.elementId} .filter-acc-panel`);
        if (panel) {
            panel.innerHTML = '<div class="alert alert-danger py-2">Error loading data</div>';
        }
    } finally {
        // Clear pending request flag and hide loader
        pendingRequests.delete(filterType);
        FacetLoader.hide(config.elementId);
    }
};



// Initialize facet search handlers
const initializeFacetSearch = () => {
    Object.entries(facetConfig).forEach(([filterType, config]) => {
        if (config.type === 'search') {
            const searchInput = document.querySelector(`#${config.elementId} input[type="search"]`);
            const searchButton = document.querySelector(`#${config.elementId} button`);
            
            if (searchInput && searchButton) {
                let timeout = null;
                
                // Handle input changes with debounce
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const facetSearch = e.target.value.trim();
                        fetchFacetData(filterType, 1, facetSearch);
                    }, 300);
                });

                // Handle search button clicks
                searchButton.addEventListener('click', () => {
                    const facetSearch = searchInput.value.trim();
                    fetchFacetData(filterType, 1, facetSearch);
                });

                // Handle Enter key press
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const facetSearch = e.target.value.trim();
                        fetchFacetData(filterType, 1, facetSearch);
                    }
                });
            }
        }
    });

    // Initialize all facets with empty search
    Object.keys(facetConfig).forEach(filterType => {
        fetchFacetData(filterType);
    });
};



// Function to get selected facet values
const getSelectedFacets = () => {
    const selectedFacets = {};
    
    Object.entries(facetConfig).forEach(([filterType, config]) => {
        const panel = document.querySelector(`#${config.elementId} .filter-acc-panel`);
        if (panel) {
            const selectedCheckboxes = panel.querySelectorAll('input[type="checkbox"]:checked');
            if (selectedCheckboxes.length > 0) {
                selectedFacets[filterType] = Array.from(selectedCheckboxes).map(cb => cb.id);
            }
        }
    });

    return selectedFacets;
};


// Initialize facets when document is ready


const renderSelectedPills = (elementId, filterType) => {
    const searchFormDiv = document.querySelector(`#${elementId} .search-form`);
    if (!searchFormDiv) return;
 
    // Get or create pills container
    let pillsDiv = searchFormDiv.previousElementSibling;
    if (!pillsDiv?.classList.contains('facet-pills')) {
        pillsDiv = document.createElement('div'); 
        pillsDiv.className = 'd-flex flex-wrap facet-pills mg-b-10';
        searchFormDiv.parentElement.insertBefore(pillsDiv, searchFormDiv);
    }
 
    if (searchState.facets[filterType]?.length) {
        const pills = searchState.facets[filterType].map(value => `
            <div class="badge-search badge-pill badge-secondary">
                <div class="facets-wrapper">
                    <div class="search-facet-filters">
                        <p class="mb-0">${value}</p>
                    </div>
                    <div class="facet-cross" style="cursor: pointer; margin-left: 11%" data-value="${value}">
                        <p class="mb-0">X</p>
                    </div>
                </div>
            </div>
        `).join('');
        pillsDiv.innerHTML = pills;
    } else {
        pillsDiv.innerHTML = '';
    }
 };
 


 

// Facet cache manager
const FacetCache = {
    cache: new Map(),

    // Generate cache key based on filter parameters
    generateKey(filterType, page, facetSearch, searchState) {
        return JSON.stringify({
            filterType,
            page,
            facetSearch,
            search: searchState.search,
            search_column: searchState.search_column
        });
    },

    // Get cached data if available
    get(filterType, page, facetSearch, searchState) {
        const key = this.generateKey(filterType, page, facetSearch, searchState);
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minute cache
            return cached.data;
        }
        return null;
    },

    // Set cache data
    set(filterType, page, facetSearch, searchState, data) {
        const key = this.generateKey(filterType, page, facetSearch, searchState);
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },

    // Clear cache for a specific filter type
    clear(filterType) {
        const keysToDelete = [];
        this.cache.forEach((value, key) => {
            const keyObj = JSON.parse(key);
            if (keyObj.filterType === filterType) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
    },

    // Clear entire cache
    clearAll() {
        this.cache.clear();
    }
};

// Mini loader component
const FacetLoader = {
    create(elementId) {
        return `
            <div id="loader-${elementId}" class="facet-loader" style="display: none;">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    },

    show(elementId) {
        const loader = document.getElementById(`loader-${elementId}`);
        if (loader) loader.style.display = 'flex';
    },

    hide(elementId) {
        const loader = document.getElementById(`loader-${elementId}`);
        if (loader) loader.style.display = 'none';
    }
};
