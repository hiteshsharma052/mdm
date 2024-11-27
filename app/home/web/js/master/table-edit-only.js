var tableViewData = [
    { "name": "AA01", "value": "Cipla" },
    { "name": "AA02", "value": "Dr Reddy" },
    { "name": "AA03", "value": "Sun Pharma" }
];

function renderTableView(data, append = false) {
    var tbody = $('#tableView tbody');
    if (!append) {
        tbody.empty();
    }

    $.each(data, function(index, item) {
        var name = item.name !== undefined ? item.name : "";
        var value = item.value !== undefined ? item.value : "";

        if (name.trim() !== "" && value.trim() !== "") {
            tbody.append(`
                <tr>
                    <td class="text-monospace"><span class="nameText">${name}</span><input class="nameInput form-control form-control-sm text-monospace" type="text" value="${name}" readonly style="display:none;"></td>
                    <td><span class="valueText">${value}</span><input class="valueInput form-control form-control-sm" type="text" value="${value}" style="display:none;"></td>
                    <td>
                        <div class="d-flex align-items-center justify-content-end">
                            <button class="btn btn-xs btn-outline-secondary editBtn mg-r-10"><i class="fa fa-pencil"></i> Edit</button>
                            <button class="btn btn-xs btn-outline-success saveBtn mg-r-10" style="display:none;"><i class="fa fa-save"></i> Save</button>
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input rowToggle" id="customSwitch-${index}" checked>
                                <label class="custom-control-label" for="customSwitch-${index}">Active</label>
                            </div>
                        </div>
                    </td>
                </tr>
            `);
        }
    });
}

function checkSaveAllVisibility() {
    if ($('.saveBtn:visible').length > 0) {
        $('#saveAllBtn').show();
    } else {
        $('#saveAllBtn').hide();
    }
}

function searchTable(query) {
    $('#tableView tbody tr').each(function() {
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
    $('#tableView tbody tr:visible').each(function() {
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
    renderTableView(tableViewData);

    // Edit row
    $('#tableView').on('click', '.editBtn', function() {
        var row = $(this).closest('tr');
        var isActive = row.find('.rowToggle').prop('checked'); // Check if active

        if (isActive) {
            row.find('.valueText').hide();
            row.find('.valueInput, .saveBtn').show();
            $(this).hide();
        } else {
            alert("This row is inactive and cannot be edited.");
        }

        checkSaveAllVisibility(); // Check visibility of Save All
    });

    // Save row
    $('#tableView').on('click', '.saveBtn', function() {
        var row = $(this).closest('tr');
        var value = row.find('.valueInput').val();

        if (value.trim() === "") {
            alert("Please fill in the value before saving.");
            return; // Exit the function early
        }

        row.find('.valueText').text(value).show();
        row.find('.valueInput, .saveBtn').hide();
        row.find('.editBtn').show();

        checkSaveAllVisibility(); // Check visibility of Save All
    });

    // Toggle Active/Inactive status with custom switch
    $('#tableView').on('change', '.rowToggle', function() {
        var row = $(this).closest('tr');
        var isChecked = $(this).prop('checked');
        var label = $(this).next('.custom-control-label');

        if (isChecked) {
            // Active: enable inputs and show Edit button
            label.text('Active');
            row.find('.valueInput').prop('disabled', false);
            row.find('.editBtn').show();
        } else {
            // Inactive: disable inputs and hide Edit/Save buttons
            label.text('Inactive');
            row.find('.valueInput').prop('disabled', true);
            row.find('.valueText').show();
            row.find('.editBtn').hide();
            row.find('.valueInput, .saveBtn').hide();

            checkSaveAllVisibility(); // Check visibility of Save All
        }
    });

    // Edit All Rows
    $('#editAllBtn').on('click', function() {
        $('#tableView tbody tr').each(function() {
            var row = $(this);
            var isActive = row.find('.rowToggle').prop('checked'); // Check if active

            if (isActive) {
                row.find('.valueText').hide();
                row.find('.valueInput, .saveBtn').show();
                row.find('.editBtn').hide();
            }
        });

        checkSaveAllVisibility(); // Check visibility of Save All
    });

    // Save All Rows
    $('#saveAllBtn').on('click', function() {
        $('#tableView tbody tr').each(function() {
            var row = $(this);
            var value = row.find('.valueInput').val();
            var isActive = row.find('.rowToggle').prop('checked'); // Check if active

            if (isActive) {
                if (value.trim() === "") {
                    alert("Please fill in all values before saving.");
                    return; // Exit the function early
                }

                row.find('.valueText').text(value).show();
                row.find('.valueInput, .saveBtn').hide();
                row.find('.editBtn').show();
            }
        });

        checkSaveAllVisibility(); // Hide Save All after saving
    });

    // Search function
    $('.search-form input').on('keyup', function() {
        var query = $(this).val();
        searchTable(query);
    });

    // Download Excel functionality
    $('#downloadXls').on('click', function() {
        downloadXLS();
    });
});
