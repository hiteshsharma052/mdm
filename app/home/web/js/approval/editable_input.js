
const data = {
    country: {type: "select", options: ["UAE", "Qatar", "Oman", "Saudi Arabia"], value: "UAE"},
    item_cat: {type: "select", options: ["Direct", "Indirect", "Consignment"], value: "Direct"},
    spl_cat: {type: "select", options: ["NA"], value: "Pharmaceutical Drugs"},
    org_code: {type: "select", options: ["Aster Medical Centre,Abu Hail-Non Pharma", "Aster Medical Centre,Abu Hail-Pharma", "Aster Medical Centre, Abu Shagara-Non Pharma", "Admh-Pharma"], value: "Admh-Pharma"},
    item_name: {type: "text", value: "Paracetamol"},
    item_desc: {type: "textarea", value: "Paracetamol is a medicine used t"},
    brand: {type: "select", options: ["RIDH PHARMA PVT LTD", "ELIO BIO CARE LIFE SCIENCES PVT LTD", "GARLANCE PHARMACEUTICALS PVT LTD","3M"], value: "3M"},
    molecule: {type: "select", options: ["15% L-ASCORBIC ACID + 1% ALPHA TOCOPHEROL + 0.5% FERULIC ACID", "2% DIOIC ACID + CAPROLOYL SALICYLIC ACID + 1.5% SALICYLIC ACID + 3.5% GLYCOLIC ACID AND 0.5% CITRIC ACID", "2% PHLORETIN + 10% L-ASCORBIC ACID + 0.5% FERULIC ACID"], value: "12% ASCORBIC ACID"},
    variant: {type: "select", options: ["0.1%", "0.2%", "0.3%", "0.4%", "0.5%", "0.6%"], value: "0.1%"},
    form: {type: "select", options: ["AEROSOL", "AMPULES", "BAG", "BALM", "BAR", "BIB"], value: "AEROSOL"},
    spl_material_flag: {type: "select", options: ["Narcotics", "Cold Chain", "Non-Registered", "Dangerous Goods", "No Special Identifier", "Unknown"], value: "Narcotics"},
    primary_uom: {type: "select", options: ["Each","Pack","Pair","Bottle","Box"], value: "Each"},
    secondary_uom: {type: "select", options: ["P/63","P/7","P/240","P/1600","P/125"], value: "P/5"},
    pharmacy_consumables: {type: "select", options: ["NA"], value: "NA"},
    list_price: {type: "text", value: "100"},
    mrp: {type: "text", value: "130"},
    inventory_item: {type: "select", options: ["Yes", "No"], value: "Yes"},
    invoice_enabled: {type: "select", options: ["Yes", "No"], value: "Yes"},
    lot_divisible: {type: "select", options: ["Yes", "No"], value: "Yes"},
    gst: {type: "select", options: ["Zero Rated", "Standard", "exempt"], value: "Standard"},
    ddc_code: {type: "text", value: "Tramadol"},
    supplier: {type: "select", options: ["RIDH PHARMA PVT LTD", "ELIO BIO CARE LIFE SCIENCES PVT LTD", "GARLANCE PHARMACEUTICALS PVT LTD","3M"], value: "3M"},
    drug_schedule: {type: "select", options: ["Yes", "No"], value: "Yes"},
};

$(document).ready(function() {
    // Populate the <p> elements with values from the JSON
    $.each(data, function(id, field) {
        // Set the value inside the <p> tag
        $(`#${id}`).text(field.value);

        // Add Edit and Save buttons dynamically
        $(`#${id}`).after(`<button class="editBtn btn btn-link p-0 mg-l-10" data-id="${id}" data-bs-toggle="tooltip" title="Edit"><i class="fa fa-pencil"></i></button>
                           <button class="saveBtn btn btn-sm btn-success btn-icon mg-l-10" data-id="${id}" style="display:none;"><i class="fa fa-save"></i></button>`);
                           
                        });
                        $('[data-bs-toggle="tooltip"]').tooltip();
    // Handle edit button click event
    $(document).on('click', '.editBtn', function() {
        let id = $(this).data('id');
        let field = data[id];
        let inputHtml = '';

        // Create the corresponding input type based on the JSON data
        if (field.type === 'text') {
            inputHtml = `<input type="text" id="input-${id}" class="form-control form-control-sm" value="${field.value}" />`;
        } else if (field.type === 'select') {
            inputHtml = `<select id="input-${id}" class="custom-select custom-select-sm">${field.options.map(option => 
                `<option value="${option}" ${option === field.value ? 'selected' : ''}>${option}</option>`
            ).join('')}</select>`;
        } else if (field.type === 'textarea') {
            inputHtml = `<textarea id="input-${id}" class="form-control form-control-sm">${field.value}</textarea>`;
        }
        
        // Replace the <p> with the input field
        $(`#${id}`).html(`<div>${inputHtml}</div>`);

        // Show Save button and hide Edit button
        $(this).hide();
        $(this).next('.saveBtn').show();
    });

    // Handle save button click event
    $(document).on('click', '.saveBtn', function() {
        let id = $(this).data('id');
        let field = data[id];
        let newValue = $(`#input-${id}`).val();

        // Update the JSON data with the new value
        field.value = newValue;

        // Replace the input with the updated value as static text
        $(`#${id}`).text(newValue);

        // Hide Save button and show Edit button again
        $(this).hide();
        $(this).prev('.editBtn').show();
    });
});
