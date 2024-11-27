
function initializeSelect2Fields() {
    const select2Configs = [

    {
        el: "#country",
        type:"Country"
    },
    {
        el: "#item_cat",
        type:"Sub_Category"
    },
    {
        el: "#brand",
        type:"Brand"
    },
    {
        el: "#molecule",
        type:"Molecule"
    },
    {
        el: "#variant",
        type:"Variant"
    },
    {
        el: "#form",
        type:"Form"
    },
    {
        el: "#spl_material_flag",
        type:"Special_Material_Flag"
    },
    {
        el: "#primary_uom",
        type:"Primary_UOM"
    },
    {
        el: "#secondary_uom",
        type:"Secondary_UOM"
    },
    {
        el: "#supplier",
        type:"Brand"
    },
    {
        el: "#inventory_item",
        type:"Inventory Item"
    },
    {
        el: "#invoice_enabled",
        type:"Invoice Enabled"
    },
    {
        el: "#drug_schedule",
        type:"Drug Schedule"
    },
    {
        el: "#lot_divisible",
        type:"Lot Divisible"
    },
    {
        el:"#vat",
        type:"VAT"
    }
]

    select2Configs.forEach(config => {
        UtilitySelect.select2utility({
            el: config.el,
            baseurl: config.baseurl || "/api/lookup/list/",
            data: { type: config.type || 'Country'},
            id_field: config.id_field || "dict_code_primary",
            name_field: config.name_field || "dict_desc_primary",
            default_selected: config.default_selected || [],
            tags: config.tags || false
        });
    });
}

const getOrganizationData = async () => {
    try {
        const formData = new FormData();
        formData.append('type', 'Organization');

        const response = await fetch('/api/lookup/list/', {
            method: 'POST',
            body: formData
        });
        
        const jsonData = await response.json();
        return jsonData.data;

    } catch (error) {
        console.log('Error fetching or processing data:', error);
        return [];
    }
};
function initializeOrgSelect() {
    // First add multiple attribute and class using jQuery
    $('#org_code').attr('multiple', 'multiple').addClass('multiple-select');
    
    getOrganizationData().then(data => {
        const selectElement = document.getElementById('org_code');
        // Add options from the data
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.dict_code_primary;
            option.textContent = item.dict_desc_primary;
            option.setAttribute('vertical', item.dict_code_secondary1);
            selectElement.appendChild(option);
        });

        $('#org_code').multiselect({

            enableHTML: false,
            buttonClass: 'custom-select',
            inheritClass: false,
            buttonWidth: 'auto',
            buttonContainer: '<div class="btn-group" />',
            dropRight: false,
            dropUp: false,
            selectedClass: 'active',
            // maxHeight: true,
            maxHeight: 300,
            includeSelectAllOption: true,
            includeSelectAllIfMoreThan: 0,
            selectAllText: ' Select all',
            selectAllValue: 'multiselect-all',
            selectAllName: false,
            selectAllNumber: true,
            selectAllJustVisible: true,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            enableFullValueFiltering: false,
            enableClickableOptGroups: false,
            enableCollapsibleOptGroups: false,
            collapseOptGroupsByDefault: false,
            filterPlaceholder: 'Search',
            filterBehavior: 'text',
            includeFilterClearBtn: false,
            preventInputChangeEvent: false,
            nonSelectedText: 'None selected',
            nSelectedText: 'selected',
            allSelectedText: 'All selected',
            numberDisplayed: 1,
            disableIfEmpty: false,
            disabledText: '',
            delimiterText: ', ',
            includeResetOption: false,
            includeResetDivider: false,
            resetText: 'Reset',
            indentGroupOptions: true,
            widthSynchronizationMode: 'never',
            buttonTextAlignment: 'left',
            });
    }); }




$(document).ready(function() {
    initializeOrgSelect();
    initializeSelect2Fields();});

$(document).ready(function() {
    
    // Verbose logging
    $("#item_cat").on("change", function() {

        let selected_val = $(this).val();
        let selected_text = $(this).find("option:selected").text();
        $("#sub_cat").val('').trigger('change');
        UtilitySelect.select2utility({
            el: "#sub_cat",
            baseurl: "/api/lookup/list/",
            data: { type: 'Sub_Category' , code: selected_val, desc :selected_text  },
            id_field:  "dict_code_secondary1",
            name_field:  "dict_desc_secondary1",
            default_selected:  [],
            tags:  false
        });
        
    });

});

function validateForm() {
    let isValid = true;
    const form = document.getElementById('itemMasterForm');
    
    // Reset previous error states
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    // Iterate through all form fields
    form.querySelectorAll('[required]').forEach(field => {
        // Trim the value to check for empty strings
        const value = field.value.trim();
        
        // Basic validation logic
        if (value === '') {
            isValid = false;
            field.classList.add('is-invalid');
            
            // Optional: Create or show error message
            let errorSpan = field.nextElementSibling;
            if (!errorSpan || !errorSpan.classList.contains('invalid-feedback')) {
                errorSpan = document.createElement('span');
                errorSpan.classList.add('invalid-feedback');
                errorSpan.textContent = `${field.labels[0].textContent} is required`;
                field.parentNode.insertBefore(errorSpan, field.nextSibling);
            }
        }
    });

    return isValid;
}

function saveItem(item_status){

    let valid_form = validateForm()

    if (!valid_form){
        flashMessage("Please fill all required fields","warning")
        return false
    }
    let country_code = $("#country option:selected").val();
    let country_name = $("#country option:selected").text();
    let item_category_code = $("#item_cat option:selected").val();
    let item_category_desc = $("#item_cat option:selected").text();
    let sub_category_code = $("#sub_cat option:selected").val();
    let sub_category_desc = $("#sub_cat option:selected").text();
    let organization_code = $("#org_code").val();
    let organization_desc = $("#org_code").find("option:selected").map(function() {
        return $(this).text();
    }).get();
    let item_name = $("#item_name").val();
    let item_desc = $("#item_desc").val();
   // Brand handling
    let brand_code = $("#brand option:selected").val();
    let brand_desc = brand_code === "other" ? $("#brand_other").val() : $("#brand option:selected").text();

    // Molecule handling
    let molecule_code = $("#molecule option:selected").val();
    let molecule_desc = molecule_code === "other" ? $("#molecule_other").val() : $("#molecule option:selected").text();

    // Variant handling
    let variant_code = $("#variant option:selected").val();
    let variant_desc = variant_code === "other" ? $("#variant_other").val() : $("#variant option:selected").text();

    // Form handling
    let form_code = $("#form option:selected").val();
    let form_desc = form_code === "other" ? $("#form_other").val() : $("#form option:selected").text();

    // Special material flag handling
    let special_material_flag = $("#spl_material_flag option:selected").val();
    let special_material_desc = special_material_flag === "other" ? $("#spl_material_flag_other").val() : $("#spl_material_flag option:selected").text();

    // Primary UOM handling
    let primary_uom_code = $("#primary_uom option:selected").val();
    let primary_uom_desc = primary_uom_code === "other" ? $("#primary_uom_other").val() : $("#primary_uom option:selected").text();

    // Secondary UOM handling
    let secondary_uom_code = $("#secondary_uom option:selected").val();
    let secondary_uom_desc = secondary_uom_code === "other" ? $("#secondary_uom_other").val() : $("#secondary_uom option:selected").text();

    let list_price = $("#list_price").val();
    let market_price = $("#mrp").val();
    let inventory_item = $("#inventory_item option:selected").val();
    let invoice_flag = $("#invoice_enabled option:selected").val();
    let drug_schedule = $("#drug_schedule option:selected").val();
    let lot_div = $("#lot_divisible option:selected").val();
    let vat_percentage = $("#vat option:selected").val();
    let ddc_code = $("#ddc_code").val();
    let supplier_code = $("#brand option:selected").val();
    let supplier_desc =  brand_code === "other" ? $("#brand_other").val() : $("#brand option:selected").text();
    let barcode_pack = $("#barcode_pack_size").val();
    let barcode_mrp = $("#barcode_mrp").val();
    let item_comment = $("#item_comments").val()
    let req_type = "Single"


    if (parseFloat(list_price) > parseFloat(market_price)){
        flashMessage("Market Price should be equal or greater than List Price", "warning")
        return false
    }


    // Temp till user not implemented

    let user_id = $("#roleDropdown option:selected").attr('role-id')


    let option = { 
        url: '/api/create/item/request/', 
        method: "post", 
        data : {
            "country_code": country_code,
            "country_name": country_name,
            "item_category_code": item_category_code,
            "item_category_desc": item_category_desc,
            "sub_category_code": sub_category_code,
            "sub_category_desc": sub_category_desc,
            "organization_code": JSON.stringify(organization_code),
            "organization_desc": JSON.stringify(organization_desc),
            "item_name": item_name,
            "item_desc": item_desc,
            "brand_code": brand_code,
            "brand_desc": brand_desc,
            "molecule_code": molecule_code,
            "molecule_desc": molecule_desc,
            "variant_code": variant_code,
            "variant_desc": variant_desc,
            "form_code": form_code,
            "form_desc": form_desc,
            "special_material_flag": special_material_flag,
            "special_material_desc": special_material_desc,
            "primary_uom_code": primary_uom_code,
            "primary_uom_desc": primary_uom_desc,
            "secondary_uom_code": secondary_uom_code,
            "secondary_uom_desc": secondary_uom_desc,
            "list_price": list_price,
            "market_price": market_price,
            "inventory_item": inventory_item,
            "invoice_flag": invoice_flag,
            "drug_schedule": drug_schedule,
            "lot_div": lot_div,
            "vat_percentage": vat_percentage,
            "ddc_code": ddc_code,
            "supplier_code": supplier_code,
            "supplier_desc": supplier_desc,
            "barcode_pack": barcode_pack,
            "barcode_mrp": barcode_mrp,
            "item_comment": item_comment,
            "item_status":item_status,
            "req_type":req_type,
            "user_id" : user_id //temp
        }
    };

    option['loader'] = 'itemMasterForm #loaderInternal'


    ajaxUtility.ajaxCall(option, function (res) {
        if (res.error) {
            flashMessage(res.msg, 'danger');
        }
        else{
            flashMessage('Item request Submitted', 'success');
        }    
    }) 

}



//     // for image preview
//     document.querySelector('#img-upload').onchange = function(event) {
//     let preview = document.querySelector('#preview-wrap img');
//     previewImage(event, preview);
//     }

//     // for removing image
//     document.querySelector('#remove').onclick = function() {
//     let file = document.querySelector('#img-upload');
//     let preview = document.querySelector('#preview-wrap img');
//     removeImage(file, preview);
//     }

// function previewImage(event, preview) {
//   let file = event.target.files[0]; // Get the selected file

//   // Check if a file was selected
//     if (file) {
//     // Validate the file type
//     let validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//     if (validTypes.includes(file.type)) {
//       let img = URL.createObjectURL(file);
//       preview.src = img;
//       preview.parentNode.style.display = 'block';
//     } else {
//       alert('Invalid file type. Please select a JPEG, JPG, or PNG image.');
//       removeImage(document.querySelector('#img-upload'), preview); // Reset the input and preview
//     }
//   } else {
//     preview.parentNode.style.display = 'none';
//   }
// }

// function removeImage(file, preview) {
//   preview.src = '#';
//   preview.parentNode.style.display = 'none';
//   file.value = ''; // Clear the file input
// }


$("body").on("change", "#sub_cat", function () {
    let sub_category_desc =$("#sub_cat option:selected").text();
    if (sub_category_desc === "Pharmaceuticals") {
        $("#molecule").attr("required", true);
        $("#variant").attr("required", true);
        $("#form").attr("required", true);
        $("#spl_material_flag").attr("required", true);
        $("#brand").attr("required", true);
        $(".con_req").css('display','inline-block');
    } else {
        $("#molecule").removeAttr("required");
        $("#variant").removeAttr("required");
        $("#form").removeAttr("required");
        $("#spl_material_flag").removeAttr("required");
        $("#brand").removeAttr("required");
        $(".con_req").css('display','none');
    }
})


let preventRecursion = false;

$("body").on("change", "#brand", function () {
    if (preventRecursion) return; // Prevent recursive triggers
    preventRecursion = true;

    let brand_desc = $("#brand option:selected").text();
    let brand_code = $("#brand option:selected").val();
    let brand_other = $("#brand_other option:selected").val();

    let new_option = new Option(brand_desc, brand_code, true, true);
    $("#supplier").empty().append(new_option).trigger('change'); // Clear and update supplier
    $("#supplier_other").val(brand_other);
    preventRecursion = false;
});

$("body").on("change", "#supplier", function () {
    if (preventRecursion) return; // Prevent recursive triggers
    preventRecursion = true;

    let supplier_desc = $("#supplier option:selected").text();
    let supplier_code = $("#supplier option:selected").val();
    let supplier_other = $("#supplier_other option:selected").val();

    let new_option = new Option(supplier_desc, supplier_code, true, true);
    $("#brand").empty().append(new_option).trigger('change'); // Clear and update brand
    $("#brand_other").val(supplier_other);
    preventRecursion = false;
});


function calculateMarketPrice(list_price, vertical) {
    // Normalize vertical name
    vertical = vertical.toLowerCase().trim();
    
    // Medcare: 30% Addition
    if (vertical === 'medcare uae') {
        return list_price * 1.30;
    }
    
    // Aster Clinics: Same as List Price
    if (vertical === 'aster clinics') {
        return list_price;
    }
    
    // Aster Hospitals: Slab based
    if (vertical === 'aster hospitals') {
        if (list_price >= 1000) {
            return list_price * 1.35;  // 35% addition
        }
        if (list_price > 500) {
            return list_price * 1.50;  // 50% addition
        }
        if (list_price > 100) {
            return list_price * 1.75;  // 75% addition
        }
        return list_price * 2.00;      // 100% addition
    }
    
    // Qatar, Oman, Bahrain: Manual input required
    if (['qatar', 'oman', 'bahrain'].includes(vertical)) {
        return null;
    }
    
    return null;  // For any unknown vertical
}


let debounceTimer;

const debounce = (callback, time) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time);
};

$("#list_price").on('keyup', function (evt) {

    if (evt.target.value.length > 0 ) {
    let list_price = $(this).val();
    let vertical_lis = $("#org_code").find("option:selected").map(function () {
        return $(this).attr('vertical');
    }).get()

    let vertical =vertical_lis[0]
    if (list_price && vertical) {
        // Wrap the calculation in a function
        debounce(() => {
            const marketPrice = calculateMarketPrice(list_price, vertical);
            if (marketPrice !== null) {
                // Set the calculated value to MRP input, rounded to 2 decimal places
                $("#mrp").val(marketPrice);
            } else {
                // Clear the MRP input for manual entry verticals
                $("#mrp").val('');
            }
        }, 300);
    }
    }

    
})

$("body").on("click", "#clearForm", function (e) {
    e.preventDefault();
    $('#itemMasterForm').each(function() {
        $('input:text, input:password, input[type="number"], input[type="email"], textarea', this)
        .val('')
        .trigger('change');
    
    // Reset select elements 
    $('select', this)
        .empty()
        .trigger('change');
    });

    // Clear file inputs and reset labels
    $('input[type="file"]', this).each(function() {
        $(this)
            .val('')
            .trigger('change');
        $(this)
            .next('.custom-file-label')
            .html('Choose file');
    });
    
    // Clear the supporting documents file input
    $('.upload__input')
        .val('')
        .trigger('change');
    
    // Hide and clear all image previews
    $('[id^="preview-wrap-"]').each(function() {
        $(this)
            .hide()
            .find('img')
            .attr('src', '');
    });


    $('#org_code').multiselect('deselectAll', false);
    $('#org_code').multiselect('refresh');
});


$("body").on("change", "#brand, #molecule, #variant, #form, #spl_material_flag ,#primary_uom, #secondary_uom", function (e) {
    let f_name =  $(this).attr('name');
    let other_f_name = f_name+'_other';
    if ($(this).val() == 'other'){
        $(`#`+other_f_name).css('display','block');
    }
    else{
        $(`#`+other_f_name).css('display','none');
    }

});