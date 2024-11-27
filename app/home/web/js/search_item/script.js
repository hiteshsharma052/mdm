// 
// FILE NAME : script.js
// 
// Initialize search state
const searchState = {
    page: 1,
    page_size: 20,
    search: '',
    total_pages: "",
    search_column: 'item_name',
    facets: {},  // Will store selected facet values
    appliedFilters: [] // Tracks visually displayed filters
};

const SearchCache = {
    cache: new Map(),
    
    // Generate a cache key from search state
    generateKey(searchState) {
        return JSON.stringify({
            page: searchState.page,
            page_size: searchState.page_size,
            search: searchState.search,
            search_column: searchState.search_column,
            facets: searchState.facets
        });
    },
    
    // Get cached results
    get(searchState) {
        const key = this.generateKey(searchState);
        const cached = this.cache.get(key);
        
        if (cached) {
            const now = Date.now();
            // Check if cache is still valid (5 minutes)
            if (now - cached.timestamp < 5 * 60 * 1000) {
                return cached.data;
            } else {
                // Remove expired cache entry
                this.cache.delete(key);
            }
        }
        return null;
    },
    
    // Store results in cache
    set(searchState, data) {
        const key = this.generateKey(searchState);
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        
        // Cleanup old cache entries if cache gets too large (keep last 50 searches)
        if (this.cache.size > 50) {
            const entries = Array.from(this.cache.entries());
            const oldestEntries = entries
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)
                .slice(0, entries.length - 50);
                
            oldestEntries.forEach(([key]) => this.cache.delete(key));
        }
    },
    
    // Clear the entire cache
    clear() {
        this.cache.clear();
    },
    
    // Clear cache for specific search parameters
    clearFor(searchState) {
        const key = this.generateKey(searchState);
        this.cache.delete(key);
    }
};


// Function to update the pills/badges showing applied filters
const updateFilterPills = () => {
    const pillsContainer = document.getElementById('searchPills');
    if (!pillsContainer) return;

    let pillsHtml = '';
    
    // Add search keyword pill if exists
    if (searchState.search) {
        pillsHtml += `
            <div class="badge-search badge-pill badge-secondary">
                <div class="facets-wrapper">
                    <div class="facet-filters">
                        <h6>KEYWORD:</h6>
                        <p class="mb-0 text-capitalize text-nowrap">${searchState.search}</p>
                    </div>
                    <div class="facet-cross" style="cursor: pointer; margin-left: 20px" onclick="removeFilter('keyword')">
                        <p class="mb-0">X</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Add facet filter pills
    Object.entries(searchState.facets).forEach(([facetType, values]) => {
        values.forEach(value => {
            pillsHtml += `
                <div class="badge-search badge-pill badge-secondary">
                    <div class="facets-wrapper">
                        <div class="facet-filters">
                            <h6 class="text-nowrap text-capitalize">${facetConfig[facetType]?.displayName.toUpperCase()}:</h6>
                            <p class="mb-0 text-capitalize text-nowrap">${value}</p>
                        </div>
                        <div class="facet-cross" style="cursor: pointer; margin-left: 20px" 
                             onclick="removeFilter('${facetType}', '${value}')">
                            <p class="mb-0">X</p>
                        </div>
                    </div>
                </div>
            `;
        });
    });

    pillsContainer.innerHTML = pillsHtml;

    // Show/hide the pills section based on whether there are any filters
    const isPills = document.getElementById('isPills');
    if (isPills) {
        isPills.style.display = (searchState.search || Object.keys(searchState.facets).length > 0) ? 'block' : 'none';
    }
    $('.facet-filters p').tooltipOnOverflow(); 
};

// Function to remove a filter
window.removeFilter = (filterType, value) => {
    if (filterType === 'keyword') {
        searchState.search = '';
        document.getElementById('searchScope').value = '';
    } else if (filterType in searchState.facets) {
        if (value) {
            // Remove specific value
            searchState.facets[filterType] = searchState.facets[filterType].filter(v => v !== value);
            if (searchState.facets[filterType].length === 0) {
                delete searchState.facets[filterType];
            }
            // Uncheck the corresponding checkbox
            const checkbox = document.getElementById(value);
            if (checkbox) checkbox.checked = false;
        } else {
            // Remove entire filter type
            delete searchState.facets[filterType];
        }
    }
    performSearch();
};

// Function to clear all filters
window.removeAllFilters = () => {
    // Reset search state
    searchState.search = '';
    searchState.facets = {};
    document.getElementById('searchScope').value = '';
    
    document.querySelectorAll('.filter-acc-panel').forEach(panel => {
        panel.innerHTML = '<div class="d-flex align-items-center">No Result Found...</div>';
    });

    // Remove all facet pills
    document.querySelectorAll('.facet-pills').forEach(pillsContainer => {
        pillsContainer.innerHTML = '';
    });

    // Remove all pagination containers from facets
    document.querySelectorAll('.pagination-container').forEach(container => {
        container.remove();
    });

    updateFilterPills();

    // Get the listSearchResults div and update its content
    const listSearchResults = document.getElementById('listSearchResults');
    if (listSearchResults) {
        listSearchResults.innerHTML = `
            <div id="noReusult">
                <div class="d-flex flex-column align-items-center justify-content-center">
                    <div class="wd-70p wd-sm-250 wd-lg-300 mg-b-15">
                        <img src="/common/img/aster_logo.svg" class="img-fluid" alt="">
                    </div>
                    <h1 class="tx-color-01 tx-24 tx-sm-32 tx-lg-36 mg-xl-b-5 mg-t-30">Refine Your Search</h1>
                    <h5 class="tx-16 tx-sm-18 tx-lg-20 tx-normal mg-b-20">
                        To refine your search and quickly find the information you need, please use the following filters available on the page:
                    </h5>
                    <div class="tx-color-03 mg-b-30">
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15 mg-r-5">Country</span>
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15 mg-r-5">Item Category</span>
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15 mg-r-5">Sub Category</span>
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15 mg-r-5">Item Name</span>
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15 mg-r-5">Item Description</span>
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15 mg-r-5">Organization Code</span>
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15 mg-r-5">Brand</span>
                        <span class="badge badge-pill badge-secondary rounded-20 tx-14 pd-y-7 pd-x-15">Status</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Clear pagination if it exists
    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) {
        paginationControls.innerHTML = '';
    }
};

const handleItemsPerPageChange = (e) => {
    const selectedValue = parseInt(e.target.value);
    // If value is 0 (All), set a large number or handle specially in your backend
    searchState.page_size = selectedValue === 0 ? 1000 : selectedValue;
    searchState.page = 1; // Reset to first page when changing page size
    performSearch();
};


const initializeItemsPerPage = () => {
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (!itemsPerPageSelect) return;

    // Set initial value based on searchState
    itemsPerPageSelect.value = searchState.page_size.toString();

    // Remove any existing event listeners
    itemsPerPageSelect.removeEventListener('change', handleItemsPerPageChange);
    
    // Add new event listener
    itemsPerPageSelect.addEventListener('change', handleItemsPerPageChange);
};


// Function to make the search API call
const performSearch = async () => {
    try {

        // Check cache first
        const cachedResult = SearchCache.get(searchState);
        if (cachedResult) {
            console.log('Using cached search results');
            
            searchState.total_pages = cachedResult.total_pages;
            
            // Update UI with cached results
            renderSearchResults(cachedResult);
            updateFilterPills();
            updatePaginationButtons();
            
            // Load facets from cache or fetch if needed
            Object.keys(facetConfig).forEach(filterType => {
                const cachedFacets = FacetCache.get(filterType, 1, '', searchState);
                if (!cachedFacets) {
                    fetchFacetData(filterType, 1, '');
                }
            });
            
            return;
        }

        const result = await ajaxUtility.ajaxCallAsync({
            url: '/api/items/list/',
            method: 'POST',
            data: searchState,
            isJSON: true,
        });

        console.log('Search Results:', result);
        // Load all facets after search
        Object.keys(facetConfig).forEach(filterType => {
            fetchFacetData(filterType, 1, '');
        });
        
        if (result.data) {

            searchState.total_pages = result.data.total_pages;

            SearchCache.set(searchState, result.data);

            // Update UI with results
            renderSearchResults(result.data);
            // Update filter pills
            updateFilterPills();
            // Update pagination controls
            updatePaginationButtons();
            
        }
    } catch (error) {
        console.error('Search failed:', error);
    }
};

// Handle search column selection
document.querySelector('.input-group-prepend select').addEventListener('change', (e) => {
    searchState.search_column = e.target.value;
});

// Handle search input
const searchInput = document.getElementById('searchScope');
const searchButton = searchInput.parentElement.nextElementSibling;

// Function to validate search input
const isValidSearch = (searchValue) => {
    return searchValue.trim().length > 0;
};

// Handle search button click
searchButton.addEventListener('click', () => {

    const searchValue = searchInput.value;
    
    if (!isValidSearch(searchValue)) {
        flashMessage("Please enter a valid search term", "warning");
        return;
    }

    searchState.facets = {};  
    searchState.search = searchInput.value;
    searchState.page = 1; // Reset to first page on new search

    // Uncheck all checkboxes since we're resetting facets
    document.querySelectorAll('.filter-acc-panel input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    performSearch();
});

// Handle enter key in search input
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchValue = searchInput.value;
    
        if (!isValidSearch(searchValue)) {
            flashMessage("Please enter a valid search term", "warning");
            return;
        }
        // Reset facets and page for new search
        searchState.facets = {};  // Reset facets
        searchState.search = searchInput.value;
        searchState.page = 1; // Reset to first page on new search
        
        // Uncheck all checkboxes since we're resetting facets
        document.querySelectorAll('.filter-acc-panel input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        performSearch();
    }
});


// Handle items per page change
document.querySelector('.view-toggle select').addEventListener('change', (e) => {
    searchState.page_size = parseInt(e.target.value);
    searchState.page = 1; // Reset to first page when changing page size
    performSearch();
});

// Initialize search column values
const initializeSearchColumns = () => {
    const columnSelect = document.querySelector('.input-group-prepend select');
    const columnMappings = {
        // 'all': 'Search in all',
        'item_name': 'Item Name',
        'item_code': 'Item Code',
        'country': 'Country',
        'item_category': 'Item Category',
        'sub_category': 'Sub Category',
        'item_description': 'Item Description',
        'organization': 'Organization Code',
        'brand': 'Brand'
    };

    // Clear existing options
    columnSelect.innerHTML = '';

    // Add new options
    Object.entries(columnMappings).forEach(([value, text]) => {
        const option = new Option(text, value);
        columnSelect.add(option);
    });
};

// Function to handle page navigation
const changePage = (direction) => {
    const currentPage = searchState.page;
    const totalPages = searchState.total_pages;
    
    // Validate if navigation is possible
    const canGoNext = direction === 'next' && currentPage < totalPages;
    const canGoPrev = direction === 'prev' && currentPage > 1;
    
    // Only update page if navigation is valid
    if (canGoNext) {
        searchState.page = currentPage + 1;
        performSearch();
    } else if (canGoPrev) {
        searchState.page = currentPage - 1;
        performSearch();
    }
};


// Function to update pagination buttons
const updatePaginationButtons = () => {
    const paginationContainer = document.getElementById('paginationControls');
    if (!paginationContainer) return;

    let paginationHtml = `<div class="d-flex justify-content-center align-items-center bd-t pd-t-10 mg-l-10 mg-r-15">
            <button class="btn btn-sm btn-outline-secondary" onclick="changePage('prev')" ${searchState.page === 1 ? 'disabled' : ''}><i class="fa fa-chevron-left mg-r-10" aria-hidden="true"></i> Previous</button>
            <span class="mx-2">Page ${searchState.page} of ${searchState.total_pages}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="changePage('next')">Next <i class="fa fa-chevron-right mg-l-10" aria-hidden="true"></i></button>
        <div>
    `;
    paginationContainer.innerHTML = paginationHtml;
    // ${data.total_pages}
};

const initializeSavedSearchView = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchId = urlParams.get('searchId');
    
    if (searchId) {
        try {
            const result = await ajaxUtility.ajaxCallAsync({
                url: `/api/search/get/${searchId}/`,
                method: 'GET',
                isJSON: true
            });
            
            if (result.msg === 'Success' && result.data) {
                const savedState = result.data.search_state;
                
                // Restore search keyword and column
                const searchInput = document.getElementById('searchScope');
                if (searchInput && savedState.search) {
                    searchInput.value = savedState.search;
                    searchState.search = savedState.search;
                }
                
                if (savedState.search_column) {
                    const columnSelect = document.querySelector('.input-group-prepend select');
                    if (columnSelect) {
                        columnSelect.value = savedState.search_column;
                        searchState.search_column = savedState.search_column;
                    }
                }
                
                // Restore facets
                if (savedState.facets) {
                    searchState.facets = savedState.facets;
                }
                
                // Restore pagination state
                if (savedState.page) searchState.page = savedState.page;
                if (savedState.page_size) searchState.page_size = savedState.page_size;
                
                // Perform search with restored state
                // This will also load all facets
                await performSearch();
                
                // Update checkboxes based on restored facets
                Object.entries(searchState.facets || {}).forEach(([filterType, values]) => {
                    values.forEach(value => {
                        const checkbox = document.getElementById(value);
                        if (checkbox) checkbox.checked = true;
                        
                        // Update pills for this facet
                        const config = facetConfig[filterType];
                        if (config) {
                            renderSelectedPills(config.elementId, filterType);
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error loading saved search:', error);
            flashMessage('Error loading saved search', 'danger');
        }
    }
};


const handleFavoriteClick = async (e) => {
    const favoriteBtn = e.target.closest('.favorite-btn');
    if (!favoriteBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const itemId = favoriteBtn.dataset.itemId;  // This gets sck_item_id from data-item-id
    const userId = $("#roleDropdown option:selected").attr('role-id');
    const icon = favoriteBtn.querySelector('i');
    
    try {
        // Don't make API call if we don't have both IDs
        if (!itemId || !userId) {
            console.error('Missing itemId or userId');
            return;
        }

        const result = await ajaxUtility.ajaxCallAsync({
            url: '/api/items/toggle-favorite/',
            method: 'POST',
            data: {
                item_id: itemId,
                user_id: userId
            },
            isJSON: true
        });

        if (result.msg === 'Success') {
            // Just toggle the heart icon class
            icon.classList.toggle('mdi-heart-outline');
            icon.classList.toggle('mdi-heart');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeDynamicFilters();
    initializeSearchColumns();
    initializeItemsPerPage();
    initializeSaveSearch();
    initializeSavedSearchView();
    // Remove existing search event listeners from the old implementation
    $('.search-btn').off('click');
    $('.search-text').off('keypress');

    document.addEventListener('click', handleFavoriteClick);

    document.addEventListener('click', (e) => {
        const viewDetailsBtn = e.target.closest('a[data-bs-toggle="collapse"]');
        if (!viewDetailsBtn) return;

        const cardBody = viewDetailsBtn.closest('.card-body');
        if (!cardBody) return;

        const itemCode = cardBody.querySelector('.item-mod')?.getAttribute('item-code');
        const cardId = viewDetailsBtn.getAttribute('href')?.substring(1)?.replace('ref-', '');

        if (itemCode && cardId) {
            fetchAndRenderItemDetails(itemCode, cardId);
        }
    });
    
    // Perform initial search to load initial data
    // performSearch();
});

// document.addEventListener('shown.bs.collapse', function(event) {
//     // Check if this is a facet collapse panel
//     if (event.target.id.startsWith('collapseFacet-')) {
//         const filterType = getFilterTypeFromElementId(event.target.id);
//         if (filterType) {
//             // Only fetch if we don't have cached data
//             const cachedData = FacetCache.get(filterType, 1, '', searchState);
//             if (!cachedData) {
//                 fetchFacetData(filterType, 1, '');
//             }
//         }
//     }
// });

