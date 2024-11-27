var jsonData = [
    { "name": "AA01", "value": "" },
];

function renderTable(data, append = false) {
    var tbody = $('#editableTable tbody');
    // if (!append) {
    //     tbody.empty(); 
    // }

    $.each(data, function(index, item) {
        var name = item.name;
        var value = item.value;
        tbody.append(`
            <tr>
                <td><span class="nameText" style="display:none;">${name}</span><input class="nameInput form-control form-control-sm" type="text" value="${name}" readonly style="display:block;"></td>
                <td><span class="valueText" style="display:none;">${value}</span><input class="valueInput form-control form-control-sm" type="text" value="${value}" style="display:block;"></td>
                <td>
                    <div class="d-flex">
                        <button class="btn btn-xs btn-primary editBtn mg-r-10" style="display:none;"><i class="fa fa-pencil"></i></button>
                        <button class="btn btn-xs btn-success saveBtn mg-r-10" style="display:none;"><i class="fa fa-save"></i></button>
                        <button class="btn btn-xs btn-danger deleteBtn"><i class="fa fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `);
    });
}
function searchTable(query) {
    $('#editableTable tbody tr').each(function() {
        var nameText = $(this).find('.nameText').text().toLowerCase();
        var valueText = $(this).find('.valueText').text().toLowerCase();
        if (nameText.includes(query.toLowerCase()) || valueText.includes(query.toLowerCase())) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function downloadXLS() {
    var tableData = [];
    $('#editableTable tbody tr:visible').each(function() {
        var name = $(this).find('.nameText').text();
        var value = $(this).find('.valueText').text();
        tableData.push([name, value]);
    });

    // Use SheetJS to export the data
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet([['Code', 'Value']].concat(tableData));
    XLSX.utils.book_append_sheet(wb, ws, "Table Data");
    XLSX.writeFile(wb, "table_data.xlsx");
}

// Initialize table with initial JSON data
$(document).ready(function() {
    renderTable(jsonData);

    // Edit row
    $('#editableTable').on('click', '.editBtn', function() {
        var row = $(this).closest('tr');
        row.find('.nameText, .valueText').hide();
        row.find('.nameInput, .valueInput, .saveBtn').show();
        $(this).hide();
    });

    // Save row
    $('#editableTable').on('click', '.saveBtn', function() {
        var row = $(this).closest('tr');
        var name = row.find('.nameInput').val();
        var value = row.find('.valueInput').val();
    
        // Check if inputs are empty
        if (name.trim() === "" || value.trim() === "") {
            alert("Please fill in both fields before saving.");
            return; // Exit the function early
        }
    
        row.find('.nameText').text(name).show();
        row.find('.valueText').text(value).show();
        row.find('.nameInput, .valueInput, .saveBtn').hide();
        row.find('.editBtn').show();
    });

    // Delete row
    $('#editableTable').on('click', '.deleteBtn', function() {
        // Show confirmation message
        var confirmDelete = confirm("Are you sure you want to delete this row?");
        
        if (confirmDelete) {
            var row = $(this).closest('tr');
            var name = row.find('.nameText').text();
            var value = row.find('.valueText').text();
    
            // Prompt user to type either name or value
            var userInput = prompt("Type either the name or value to confirm deletion:");
    
            // Check if input matches name or value
            if (userInput === name || userInput === value) {
                row.remove(); // Remove the row if input matches
            } else {
                alert("The input does not match the name or value. Row not deleted.");
            }
        }
    });

    // Add new row
    $('#addRowBtn').click(function() {
        $('#editableTable tbody').prepend(`
            <tr>
                <td class="highlight"><span class="nameText"></span><input class="nameInput form-control form-control-sm" type="text" value="AA01" readonly></td>
                <td class="highlight"><span class="valueText"></span><input class="valueInput form-control form-control-sm" type="text" value=""></td>
                <td class="highlight">
                    <div class="d-flex">
                        <button class="btn btn-xs btn-primary editBtn mg-r-10" style="display:none;"><i class="fa fa-pencil"></i></button>
                        <button class="btn btn-xs btn-success saveBtn mg-r-10" style="display:none;"><i class="fa fa-save"></i></button>
                        <button class="btn btn-xs btn-danger deleteBtn"><i class="fa fa-trash"></i></button>
                    </div>

                </td>
            </tr>
        `);
    });

     // Search function
     $('#addTableSearch .search-form input').on('keyup', function() {
        var query = $(this).val();
        searchTable(query);
    });

    // Download Excel functionality
    $('#tableDownloadXls').on('click', function() {
        downloadXLS();
    });

    // Drag-and-drop functionality
    var dropZone = $('#dropZone');

    dropZone.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });

    dropZone.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });

    dropZone.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');

        var files = e.originalEvent.dataTransfer.files;
        handleFileUpload(files[0]);
    });

    dropZone.on('click', function() {
        $('#xlsFile').click();
    });

    $('#xlsFile').on('change', function(e) {
        var file = e.target.files[0];
        handleFileUpload(file);
    });

function handleFileUpload(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var data = new Uint8Array(event.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[sheetName];
        var json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        var uploadedData = json.map(function(row) {
            return { name: row[0], value: row[1] };
        }).filter(function(item) {
            return item.name && item.value && item.name.trim() !== "" && item.value.trim() !== "";
        });

        jsonData = jsonData.concat(uploadedData);

        uploadedData.forEach(function(item) {
            $('#editableTable tbody').prepend(` // Prepend to add at the top
                <tr>
                    <td class="highlight"><span class="nameText">${item.name}</span><input class="nameInput form-control form-control-sm" type="text" value="${item.name}" style="display:none;"></td>
                    <td class="highlight"><span class="valueText">${item.value}</span><input class="valueInput form-control form-control-sm" type="text" value="${item.value}" style="display:none;"></td>
                    <td class="highlight">
                        <div class="d-flex">
                            <button class="btn btn-xs btn-primary editBtn mg-r-10" style="display:none;"><i class="fa fa-pencil"></i> Edit</button>
                            <button class="btn btn-xs btn-success saveBtn mg-r-10" style="display:none;"><i class="fa fa-save"></i> Save</button>
                            <button class="btn btn-xs btn-danger deleteBtn"><i class="fa fa-trash"></i> Delete</button>
                        </div>
                    </td>
                </tr>
            `);
        });
    };
    reader.readAsArrayBuffer(file);
}

});