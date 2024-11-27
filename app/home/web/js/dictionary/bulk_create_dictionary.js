$(document).ready(function() {
    const expectedColumns = [
        "Code", "Value"
    ];

    const dropZone = $('#dropZone');
    const fileInput = $('#uploadXls');
    const errorDiv = $('#error');

    // Populate the table headers with expected columns + Action header
    expectedColumns.forEach(column => {
        $('#tableHeaders').append(`<th>${column}</th>`);
    });
    $('#tableHeaders').append('<th>Actions</th>');  // Add Actions header

    // Open file picker when clicking on dropZone
    dropZone.click(function() {
        fileInput.click();
    });

    // Handle file input change (manual selection)
    fileInput.change(function(e) {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Handle drag-and-drop functionality
    dropZone.on('dragover', function(e) {
        e.preventDefault();
        dropZone.addClass('dragover');
    });

    dropZone.on('dragleave', function(e) {
        e.preventDefault();
        dropZone.removeClass('dragover');
    });

    dropZone.on('drop', function(e) {
        e.preventDefault();
        dropZone.removeClass('dragover');

        const file = e.originalEvent.dataTransfer.files[0];
        handleFile(file);
    });

    // Function to handle file parsing and display
    function handleFile(file) {
        if (!file) return;
        
        const reader = new FileReader();

        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Check if the columns in the first row (header) match the expected columns
            const fileHeaders = jsonData[0];
            if (JSON.stringify(fileHeaders) !== JSON.stringify(expectedColumns)) {
                displayError("Column names do not match the expected format.");
                return;
            }

            // If no error, display the preview
            displayPreview(jsonData.slice(1));  // Slice to remove the header row
        };

        reader.readAsArrayBuffer(file);
    }

    // Function to display the file contents in a table
    function displayPreview(data) {
        $('#tableBody').empty(); // Clear any existing rows
        errorDiv.text(''); // Clear any existing errors
        
        // Loop through each row of data
        data.forEach((row, rowIndex) => {
            let rowHtml = '<tr>';

            expectedColumns.forEach((col, colIndex) => {
                const cellValue = row[colIndex] ? row[colIndex] : '';

                // Check if value is comma-separated and create dropdown or text
                if (cellValue.includes(',')) {
                    const options = cellValue.split(',').map(option => `<option value="${option.trim()}">${option.trim()}</option>`);
                    rowHtml += `<td><select class="custom-select custom-select-sm" disabled>${options.join('')}</select></td>`;
                } else {
                    rowHtml += `<td><input type="text" class="form-control form-control-sm" value="${cellValue}" disabled /></td>`;
                }
            });

            // Add Edit and Delete buttons
            rowHtml += `
                <td>
                    <button class="btn btn-xs btn-primary edit-btn">Edit</button>
                    <button class="btn btn-xs btn-danger delete-btn">Delete</button>
                </td>
            `;
            rowHtml += '</tr>';
            $('#tableBody').append(rowHtml);
        });

        // Handle edit button click
        $('.edit-btn').click(function() {
            const row = $(this).closest('tr');
            const isEditing = $(this).text() === 'Save';

            if (isEditing) {
                // Save the row
                row.find('input, select').prop('disabled', true);
                $(this).text('Edit');
            } else {
                // Make the row editable
                row.find('input, select').prop('disabled', false);
                $(this).text('Save');
            }
        });

        // Handle delete button click
        $('.delete-btn').click(function() {
            $(this).closest('tr').remove();  // Remove the entire row
        });
    }

    // Function to display an error message
    function displayError(message) {
        errorDiv.text(message);
        $('#tableBody').empty(); // Clear any existing rows in the table
    }
});
