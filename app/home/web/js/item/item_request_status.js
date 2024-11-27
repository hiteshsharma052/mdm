

function reqStatusTable(data){
    $("#dictTable").DataTable().destroy();
    let trs='';
    let submit_count = 0;
    let draft_count = 0;

    $.each(data,function(_,ele){
        let badge_class = '';
        if (ele.request_progress=='Submitted'){
            badge_class = 'badge-success'; 
            submit_count += 1;
        }
        else if (ele.request_progress=='Draft'){
            badge_class = 'badge-warning';
            draft_count += 1;
        }
        trs+=`<tr>
                <td>
                
                    <div class="d-flex">
                        <div class="avatar d-none d-sm-block">
                            <span class="avatar-initial rounded-circle ${ele.request_type === 'Add' ? 'bg-primary' : 'bg-orange'} op-5">
                                <i class="fa ${ele.request_type === 'Add' ? 'fa-plus' : 'fa-edit'}"></i>
                            </span>
                        </div>
                        <div class="pd-sm-l-10">
                            <p class="tx-medium mg-b-2">${ele.request_id}</p>
                            <small class="tx-12 tx-color-03 mg-b-0">${ele.created_at}</small>
                        </div>
                    </div>
                </td>
                <td><div class="text-wrap">${ele.item_name}</div></td>
                <td>${ele.item_category_desc}</td>
                <td>${ele.sub_category_desc || ''}</td>
                <td class="hide">${ele.created_at}</td>
                <td><span class="badge ${badge_class}" id="badge-status">${ele.request_progress}</span></td>
                <td>${ele.request_type}</td>
                <td>
                    <a href="#progress_level_01" data-bs-toggle="modal" class="d-flex align-items-baseline">
                        <div class="progress wd-150">
                            <div class="progress-bar bg-warning wd-30p" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <i class="feather feather-info mg-l-5"></i>
                    </a>
                </td>                
                <td>${ele.req_pending_at}</td>
                
                <td>
                    <div class="d-flex justify-content-start">
                        <div class="bgicon" title="View">
                            <button class="button view_item_detail" item-name="${ele.item_name}" request-id="${ele.request_id}" data-bs-toggle="modal"><i aria-hidden="true" class="mdi mdi-eye"></i></button>
                        </div>`
                        if (ele.request_progress=="Draft"){
                            trs+=`
                            <div class="bgicon" title="View">
                                <button class="button edit_item_detail" item-name="${ele.item_name}" request-id="${ele.request_id}"><i aria-hidden="true" class="mdi mdi-pencil"></i></button>
                            </div>
                            `
                        }
                        trs+=`

                    </div>
                </td>
            </tr>`
    });
    // <td>${ele.created_at}</td>
    $("#itm_submitted").text(submit_count);
    $('#itm_draft').text(draft_count);
    $('#req_status_table').html(trs);

    $("#dictTable").dataTable(
		{ targets: 'no-sort', orderable: false ,
            order: [[4, 'desc']]
	});
}



function loadRequestList(status_type=false,start_date=false,end_date=""){
    let user_id = $("#roleDropdown option:selected").attr('role-id');

    let option = { 
        url: '/api/get/item/request/list/', 
        method: "post", 
        data : {
            "user_id" : user_id, //temp
            "status_type" : status_type,
            "start_date" : start_date,
            "end_date" : end_date
        }
    };

    ajaxUtility.ajaxCall(option, function (res) {
        if (res.error) {
            flashMessage(res.msg, 'danger');
        }
        else{
            let data = res.data
            reqStatusTable(data);
            console.log(data)
        }    
    }) 

}


function renderItemModal(data){



    let str_ = ``
    str_ +=`
    <div class="d-flex">
        <h4 class="mg-b-20 mg-sm-b-25 tx-18">${data.item_name}</h4>
        <a href="" role="button" class="close pos-absolute t-15 r-15" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">×</span>
        </a>
    </div>


    <div class="row">
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Item Code</label>
            <p class="tx-13 mg-b-0" id="item_code">${data.item_code || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Country</label>
            <p class="tx-13 mg-b-0" id="country">${data.country_name || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Item Category</label>
            <p class="tx-13 mg-b-0" id="item_cat">${data.item_category_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Sub Category</label>
            <p class="tx-13 mg-b-0" id="spl_cat">${data.sub_category_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
    <div class="form-group">
        <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Organization</label>
        <p class="tx-13 mg-b-0" id="org_code">
            <span id="org-preview"></span>
            <a href="javascript:void(0)" id="more-orgs" class="d-none text-nowrap" tabindex="0" 
               data-bs-toggle="popover" data-bs-trigger="focus" 
               data-bs-placement="top">+ <span id="org-count"></span> more</a>
        </p>
    </div>
</div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Item Name</label>
            <p class="tx-13 mg-b-0" id="item_name">${data.item_name || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Item Description</label>
            <p class="tx-13 mg-b-0 text-truncate" id="item_desc">${data.item_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Brand</label>
            <p class="tx-13 mg-b-0" id="brand">${data.brand_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Molecule</label>
            <p class="tx-13 mg-b-0" id="molecule">${data.molecule_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Variant</label>
            <p class="tx-13 mg-b-0" id="variant">${data.variant_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Form</label>
            <p class="tx-13 mg-b-0" id="form">${data.form_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Special Material Flag</label>
            <p class="tx-13 mg-b-0" id="spl_material_flag">${data.special_material_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Primary UOM</label>
            <p class="tx-13 mg-b-0" id="primary_uom">${data.primary_uom_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Secondary UOM</label>
            <p class="tx-13 mg-b-0" id="secondary_uom">${data.secondary_uom_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">List Price</label>
            <p class="tx-13 mg-b-0" id="list_price">${data.list_price || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Market Price</label>
            <p class="tx-13 mg-b-0" id="mrp">${data.market_price || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Inventory Item</label>
            <p class="tx-13 mg-b-0" id="inventory_item">${data.inventory_item || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Invoice Enabled</label>
            <p class="tx-13 mg-b-0" id="invoice_enabled">${data.invoice_flag || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Drug Schedule</label>
            <p class="tx-13 mg-b-0" id="drug_schedule">${data.drug_schedule || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Lot Divisible</label>
            <p class="tx-13 mg-b-0" id="lot_divisible">${data.lot_div || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">VAT %</label>
            <p class="tx-13 mg-b-0" id="vat">${data.vat_percentage || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">DDC Code</label>
            <p class="tx-13 mg-b-0" id="ddc_code">${data.ddc_code|| ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Supplier</label>
            <p class="tx-13 mg-b-0" id="supplier">${data.supplier_desc || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Barcode Pack size</label>
            <p class="tx-13 mg-b-0" id="">${data.barcode_pack || ""}</p>
        </div>
        </div>
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-2">
        <div class="form-group">
            <label class="tx-10 tx-medium tx-spacing-1 tx-color-03 tx-uppercase tx-sans">Barcode MRP</label>
            <p class="tx-13 mg-b-0" id="">${data.barcode_mrp || ""}</p>
        </div>
        </div>
    </div>
    `;

    $("#item_detail").html(str_);

    // Limit to 3 values
    const limit = 2;
    const organizations = data.organizations.map(ele => ele.organization_desc);
    const previewOrgs = organizations.slice(0, limit);
    const remainingOrgs = organizations.slice(limit);

    document.getElementById("org-preview").innerText = previewOrgs.join(", ");

    if (remainingOrgs.length > 0) {
        const moreLink = document.getElementById("more-orgs");
        document.getElementById("org-count").innerText = remainingOrgs.length;
        moreLink.classList.remove("d-none");
        const popoverContent = `
                <div class="d-flex flex-wrap">
                    ${remainingOrgs
                        .map(org => `<span class="badge badge-light pd-y-6 pd-x-10 mg-r-5 mg-b-5">${org}</span>`)
                        .join("")}
                </div>
            `;
        const popover = new bootstrap.Popover(moreLink, {
            title: "Organization Code",
            content: popoverContent,
            html: true,
            customClass: "custom-popover",
        });
    }
}


$("body").on("click", ".view_item_detail", function () {

    let request_id = $(this).attr('request-id');
    let item_name = $(this).attr('item-name');

    let option = { 
        url: '/api/items/get/detail/', 
        method: "post", 
        data : {
            "request_id" : request_id,
            "item_name" :  item_name
        }
    };

    ajaxUtility.ajaxCall(option, function (res) {
        if (res.error) {
            flashMessage(res.msg, 'danger');
        }
        else{
            $("#item_detail_modal").modal('show');

            let data = res.data;
            renderItemModal(data);
        }    
    }) 
})










