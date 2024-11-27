// 
// FILE NAME : facet_side_bar.js 
// 

// Configuration object for filter sections
const filterConfig = {
    sections: [
        {
            id: 'country',
            title: 'Country',
            type: 'search',
            elementId: 'collapseFacet-country'
        },
        {
            id: 'item_category',
            title: 'Item Category',
            type: 'search',
            elementId: 'collapseFacet-Catalogue'
        },
        {
            id: 'sub_category',
            title: 'Sub Category',
            type: 'search',
            elementId: 'collapseFacet-Scope'
        },
        {
            id: 'item_name',
            title: 'Item Name',
            type: 'search',
            elementId: 'collapseFacet-itemname'
        },
        {
            id: 'item_code',
            title: 'Item Code',
            type: 'search',
            elementId: 'collapseFacet-itemid'
        },
        {
            id: 'item_description',
            title: 'Item Description',
            type: 'search',
            elementId: 'collapseFacet-itemdesc'
        },
        {
            id: 'organization',
            title: 'Organization Code',
            type: 'search',
            elementId: 'collapseFacet-orgcode'
        },
        {
            id: 'brand',
            title: 'Brand',
            type: 'search',
            elementId: 'collapseFacet-kind'
        },
        {
            id: 'item_status',
            title: 'Status',
            type: 'checkbox',
            elementId: 'collapseFacet-status',
            options: [
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ]
        },
        {
            id: 'invoice_flag',
            title: 'Invoice Enabled',
            type: 'checkbox',
            elementId: 'collapseFacet-invoice_enabled',
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
            ]
        }
    ]
};

// Function to generate search filter HTML
function generateSearchFilter(section) {
    return `
        <div class="search-form ht-30">
            <input type="search" class="form-control ht-30 facet-search-input" 
                   data-filter-type="${section.id}"
                   placeholder="Search item">
            <button class="btn facet-search-button" type="button" data-filter-type="${section.id}">
                <i class="feather-search"></i>
            </button>
        </div>
        <div class="filter-acc-panel">
            <div class="d-flex align-items-center">
                No Result Found...
            </div>
        </div>
    `;
}

// Function to generate checkbox filter HTML
function generateCheckboxFilter(section) {
    const checkboxes = section.options.map(option => `
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="${option.value}">
            <label class="custom-control-label" for="${option.value}">${option.label}</label>
        </div>
    `).join('');

    return `
        <div class="filter-acc-panel">
            ${checkboxes}
        </div>
    `;
}

// Function to generate filter section HTML
function generateFilterSection(section) {
    return `
        <div class="filter-acc" role="tablist">
            <a class="collapse-panel d-flex align-items-center justify-content-between collapsed"
                data-bs-toggle="collapse" 
                href="#${section.elementId}" 
                data-filter-type="${section.id}"
                role="button" 
                aria-expanded="false"
                aria-controls="collapseFilters">
                <h6>${section.title}</h6>
                <i class="fa fa-plus" aria-hidden="true"></i>
            </a>
            <div class="mg-t-10 collapse" id="${section.elementId}" style="">
                ${FacetLoader.create(section.elementId)}
                ${section.type === 'search' ? generateSearchFilter(section) : generateCheckboxFilter(section)}
            </div>
        </div>
    `;
}


// Function to initialize the dynamic filter accordion
// Add handler for apply filter button in initializeDynamicFilters
function initializeDynamicFilters() {
    // Generate all filter sections
    const filterSections = filterConfig.sections.map(section => generateFilterSection(section)).join('');
    
    // Add apply filter button
    const applyButton = `
        <a href="#" class="btn btn-block btn-xs btn-primary mg-b-15" id="applyFiltersBtn">
            Apply Filter 
        </a>
    `;
    
    // Combine all elements
    const filterHTML = filterSections + applyButton;
    
    // Insert into sidebar-search-list
    $('#sidebar-search-list').html(filterHTML);
    
    // Initialize facet configuration
    window.facetConfig = filterConfig.sections.reduce((acc, section) => {
        acc[section.id] = {
            elementId: section.elementId,
            displayName: section.title,
            type: section.type
        };
        return acc;
    }, {});

    // Initialize handlers
    initializeCheckboxHandlers();
    initializeFacetSearchHandlers();
    
    // Add click handler for apply filter button
    document.getElementById('applyFiltersBtn').addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });
}

// Initialize lazy load handlers
function initializeLazyLoadHandlers() {
    document.querySelectorAll('.collapse-panel').forEach(panel => {
        panel.addEventListener('click', (e) => {
            const filterType = e.currentTarget.dataset.filterType;
            const isExpanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
            
            if (!isExpanded && filterType) {
                // Only fetch if we don't have cached data
                const cachedData = FacetCache.get(filterType, 1, '', searchState);
                if (!cachedData) {
                    fetchFacetData(filterType, 1, '');
                }
            }
        });
    });
}


function initializeFacetSearchHandlers() {
    // Handle input changes with debounce for all search inputs
    document.querySelectorAll('.facet-search-input').forEach(searchInput => {
        let timeout = null;
        const filterType = searchInput.dataset.filterType;

        // Input event with debounce
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const facetSearch = e.target.value.trim();
                fetchFacetData(filterType, 1, facetSearch);
            }, 300);
        });

        // Enter key event
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const facetSearch = e.target.value.trim();
                fetchFacetData(filterType, 1, facetSearch);
            }
        });
    });

    // Handle search button clicks
    document.querySelectorAll('.facet-search-button').forEach(button => {
        const filterType = button.dataset.filterType;
        button.addEventListener('click', () => {
            const searchInput = button.previousElementSibling;
            const facetSearch = searchInput.value.trim();
            fetchFacetData(filterType, 1, facetSearch);
        });
    });
}


const initializeCheckboxHandlers = () => {
    document.getElementById('sidebar-search-list').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const collapseDiv = e.target.closest('[id^="collapseFacet-"]');
            if (!collapseDiv) return;

            const filterType = getFilterTypeFromElementId(collapseDiv.id);
            if (!filterType) return;

            const value = e.target.id;
            if (!searchState.facets[filterType]) {
                searchState.facets[filterType] = [];
            }

            if (e.target.checked) {
                searchState.facets[filterType].push(value);
            } else {
                searchState.facets[filterType] = searchState.facets[filterType]
                    .filter(v => v !== value);
            }

            if (searchState.facets[filterType].length === 0) {
                delete searchState.facets[filterType];
            }

            // Update pills
            renderSelectedPills(collapseDiv.id, filterType);

            console.log('Facet updated:', {
                type: filterType,
                value: value,
                checked: e.target.checked,
                currentState: searchState.facets
            });
        }
    });

    // Handle pill removal clicks using event delegation
    document.getElementById('sidebar-search-list').addEventListener('click', (e) => {
        const crossButton = e.target.closest('.facet-cross');
        if (!crossButton) return;

        const pill = crossButton.closest('.badge-search');
        const value = crossButton.dataset.value;
        const collapseDiv = crossButton.closest('[id^="collapseFacet-"]');
        const filterType = getFilterTypeFromElementId(collapseDiv.id);

        // Uncheck checkbox
        const checkbox = document.getElementById(value);
        if (checkbox) checkbox.checked = false;

        // Update state
        if (searchState.facets[filterType]) {
            searchState.facets[filterType] = searchState.facets[filterType].filter(v => v !== value);
            if (searchState.facets[filterType].length === 0) {
                delete searchState.facets[filterType];
            }
        }

        // Re-render pills
        renderSelectedPills(collapseDiv.id, filterType);
    });
};
