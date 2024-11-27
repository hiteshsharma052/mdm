// Function to generate a unique ID
const generateUniqueId = () => 'id-' + Math.random().toString(36).substr(2, 16);

// Function to get first letter for avatar
const getAvatarLetter = (name) => name ? name.charAt(0).toUpperCase() : 'I';


// Add this near the top with other const declarations
const ItemDetailsCache = {
    _cache: new Map(),
    get: function(itemCode) {
        return this._cache.get(itemCode);
    },
    set: function(itemCode, data) {
        this._cache.set(itemCode, data);
    },
    has: function(itemCode) {
        return this._cache.has(itemCode);
    },
    clear: function(itemCode) {
        if (itemCode) {
            this._cache.delete(itemCode);
        } else {
            this._cache.clear();
        }
    }
};

const formatOrganizations = (organizations, maxDisplay = 2) => {
    if (!organizations || !organizations.length) return '--';
    
    const totalOrgs = organizations.length;
    const displayOrgs = organizations.slice(0, maxDisplay).map(org => org.desc);
    const remainingCount = totalOrgs - maxDisplay;
    
    if (remainingCount > 0) {
        return `
            <span class="org-list">${displayOrgs.join(', ')}</span>
            <a href="#" class="tx-12 mg-l-5" 
               data-bs-toggle="tooltip" 
               data-bs-html="true"
               title="${organizations.map(org => org.desc).join('<br/>')}">
                +${remainingCount} more
            </a>`;
    }
    
    return displayOrgs.join(', ');
};

// Function to render a single item card
const renderItemCard = (item) => {
    const cardId = generateUniqueId();
    const detailsId = `ref-${cardId}`;
    
    return `
        <div class="card mg-b-10">
            <div class="card-body padding-10">
                <div class="pd-10" role="tab" id="heading-${cardId}">
                    <div class="d-flex justify-content-between">
                        <div class="details-wrapper d-flex">
                            <div class="wd-45">
                                <div class="avatar">
                                    <span class="avatar-initial rounded-circle bg-gray-600">${getAvatarLetter(item.item_name)}</span>
                                </div>
                            </div>
                            <div class="pd-x-10">
                                <h4 class="tx-bold tx-16 mg-b-0 d-inline-flex text-primary columnName">${item.item_name}</h4>
                                <p class="mg-b-5-f">${item.item_desc || ''}</p>
                                <div class="prop-deatils">
                                    <div class="d-sm-inline bold mr-1 bold-txt">Category: 
                                        <span class="tx-normal mr-2">${item.item_category_desc || '--'}</span>
                                    </div>
                                    <div class="d-sm-inline bold mr-1 bold-txt">Sub Category: 
                                        <span class="tx-normal mr-2">${item.sub_category_desc || '--'}</span>
                                    </div>
                                    <div class="d-sm-inline bold mr-1 bold-txt">Brand: 
                                        <span class="tx-normal mr-2">${item.brand_desc || '--'}</span>
                                    </div>
                                    <div class="d-sm-inline bold mr-1 bold-txt">Status: 
                                        <span class="tx-normal mr-2">${item.is_active || '--'}</span>
                                    </div>
                                    <div class="d-sm-inline bold mr-1 bold-txt">Created Date: 
                                        <span class="tx-normal mr-2">${item.created_date || '--'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center pd-x-10">
                            <div class="mg-l-15">
                                <a class="btn btn-xs btn-outline-primary text-nowrap" href="#${detailsId}"
                                    data-bs-toggle="collapse" data-parent="#accordion" aria-controls="collapseOne">
                                    <i class="mdi mdi-eye"></i> View Details</a>
                            </div>
                            <div class="mg-l-15">
                                <button class="btn btn-xs btn-outline-info requestor admin item-mod text-nowrap" item-code="${item.item_code}">
                                    <i class="mdi mdi-pencil"></i> Modify</button>
                            </div>
                            <div class="mg-l-15">
                                <a class="btn btn-xs btn-outline-secondary superuser text-nowrap" style="display: none;" href="#">
                                    <i class="mdi mdi-null"></i> Inactive</a>
                            </div>
                            <div class="mg-t-3 mg-l-20">
                                <a href="javascript:void(0);" 
                                   class="favorite-btn"
                                   data-item-id="${item.item_code}" data-bs-toggle="tooltip" data-placement="top" title="Favourites">
                                    <i class="mdi ${item.is_favorite ? 'mdi-heart' : 'mdi-heart-outline'} text-danger tx-20"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="${detailsId}" class="panel-collapse collapse in" role="tabpanel"
                    aria-labelledby="heading-${cardId}" data-parent="#accordion">
                    <div class="position-relative">
                        <div class="mg-t-0 mg-l-60 mg-20">
                            <ul class="nav nav-line" id="infoTab" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active" id="home-tab5" data-bs-toggle="tab" href="#information-${cardId}" role="tab"
                                        aria-controls="information" aria-selected="true">Information</a>
                                </li>
                                <li class="nav-item" style="display:none">
                                    <a class="nav-link" id="profile-tab5" data-bs-toggle="tab" href="#history-${cardId}" role="tab"
                                        aria-controls="profile" aria-selected="false">History</a>
                                </li>
                            </ul>
                            <div class="tab-content mg-t-20">
                                <div class="tab-pane fade show active" id="information-${cardId}" role="tabpanel">
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="loading-placeholder" style="display: none;">
                                                Loading item details...
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="history-${cardId}" role="tabpanel">
                                    <table class="table table-dashboard-three w-100" aria-describedby="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Requested by</th>
                                                <th>Email ID</th>
                                                <th>Updated Field</th>
                                                <th>Old Value</th>
                                                <th>New Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>2024-10-07 17:51:26</td>
                                                <td>Satish Kumar</td>
                                                <td>satish.kumar@scikiq.com</td>
                                                <td>List Price</td>
                                                <td>80</td>
                                                <td>100</td>
                                            </tr>
                                            <tr>
                                                <td>2024-10-03 07:51:26</td>
                                                <td>Satish Kumar</td>
                                                <td>satish.kumar@scikiq.com</td>
                                                <td>List Price</td>
                                                <td>70</td>
                                                <td>80</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const fetchAndRenderItemDetails = async (itemCode, cardId) => {
    try {
        const detailsContainer = document.querySelector(`#information-${cardId}`);
        if (!detailsContainer) return;

        // Show loading
        detailsContainer.innerHTML = `
            <div class="row">
                <div class="col-12 text-center p-4">
                    <div class="spinner-border text-primary"></div>
                </div>
            </div>`;

        // Check cache
        if (ItemDetailsCache.has(itemCode)) {
            detailsContainer.innerHTML = renderInformationTab(ItemDetailsCache.get(itemCode));
            return;
        }

        // Fetch data
        const response = await fetch('/api/get/item/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item_code: itemCode })
        });

        const result = await response.json();
        
        // Changed here - checking result.data.data instead of just result.data
        if (result.data && result.msg === "Success") {
            // Cache it - storing the actual item data
            ItemDetailsCache.set(itemCode, result.data);
            // Render it
            detailsContainer.innerHTML = renderInformationTab(result.data);
            // Initialize tooltips
            $('[data-bs-toggle="tooltip"]').tooltip();
        } else {
            detailsContainer.innerHTML = '<div class="alert alert-danger">Failed to load details</div>';
        }

    } catch (error) {
        console.error('Error:', error);
        if (detailsContainer) {
            detailsContainer.innerHTML = '<div class="alert alert-danger">Error loading details</div>';
        }
    }
};
const renderDetailField = (label, value) => {
    return `
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
            <div class="form-group">
                <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">${label}</label>
                <p class="tx-13 mg-b-0">${value || '--'}</p>
            </div>
        </div>
    `;
};

const renderInformationTab = (item) => {
    return `
    <div class="row">
        ${renderDetailField('Item Code', item.item_code)}
        ${renderDetailField('Country', item.country_name)}
        ${renderDetailField('Item Category', item.item_category_desc)}
        ${renderDetailField('Sub Category', item.sub_category_desc)}
        ${renderDetailField('Vertical Name', item.vertical_name)}
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Organizations:</label>
            <p class="tx-13 mg-b-0">${formatOrganizations(item.organizations)}</p>
        </div>
        ${renderDetailField('Item Name', item.item_name)}
        ${renderDetailField('Item Description', item.item_desc)}
        ${renderDetailField('Brand', item.brand_desc)}
        ${renderDetailField('Molecule', item.molecule_desc)}
        ${renderDetailField('Variant', item.variant_desc)}
        ${renderDetailField('Form', item.form_desc)}
        ${renderDetailField('Special Material Flag', item.special_material_desc)}
        ${renderDetailField('Primary UOM', item.primary_uom_desc)}
        ${renderDetailField('Secondary UOM', item.secondary_uom_desc)}
        ${renderDetailField('List Price', item.list_price)}
        ${renderDetailField('Market Price', item.market_price)}
        ${renderDetailField('Inventory Item', item.inventory_item === 'Y' ? 'Yes' : 'No')}
        ${renderDetailField('Invoice Enabled', item.invoice_flag === 'Y' ? 'Yes' : 'No')}
        ${renderDetailField('Drug Schedule', item.drug_schedule)}
        ${renderDetailField('Lot Divisible', item.lot_div === 'Y' ? 'Yes' : 'No')}
        ${renderDetailField('VAT %', item.vat_percentage)}
        ${renderDetailField('DDC Code', item.ddc_code)}
        ${renderDetailField('Supplier', item.supplier_desc)}
        ${renderDetailField('Barcode Pack size', item.barcode_pack)}
        ${renderDetailField('Barcode MRP', item.barcode_mrp)}
        ${renderDetailField('Status', item.is_active)}
        ${renderDetailField('Created By', item.created_by)}
        ${renderDetailField('Modified By', item.modified_by)}
        ${renderDetailField('Modified Date', item.modified_date)}
        ${renderDetailField('Item Request Type', item.item_req_type)}
        ${renderDetailField('Item Status', item.item_status)}
    </div>`;
};



// Function to render the search results
const renderSearchResults = (results) => {
    const resultsContainer = document.getElementById('listSearchResults');
    if (!resultsContainer) return;

    // Clear existing results
    resultsContainer.innerHTML = '';
    
    // Update result count
    const searchCount = document.getElementById('searchCount');
    if (searchCount) {
        searchCount.textContent = results.total_items || 0;
    }

    // Render each item
    results.items.forEach(item => {
        resultsContainer.innerHTML += renderItemCard(item);
        $('[data-bs-toggle="tooltip"]').tooltip();

    });

    // initTooltips();

};

$("body").on("click", ".item-mod", function () {

    let item_code = $(this).attr('item-code');
    window.location.assign('/modify_item/?item_code=' + item_code);

})

