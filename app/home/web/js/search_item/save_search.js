// Function to save current search
// Function to save current search
const saveCurrentSearch = async () => {
    const searchName = document.getElementById('search_name').value;
    const searchDescription = document.getElementById('item_comments').value;
    const userId = $("#roleDropdown option:selected").attr('role-id');

    // Validate inputs
    if (!searchName.trim()) {
        alert('Please enter a search name');
        return;
    }

    if (!userId) {
        alert('User ID not found');
        return;
    }

    let option = {
        url: '/api/search/save/',  // CORRECTED URL
        method: 'POST',
        data: {
            user_id: userId,
            search_name: searchName,
            search_description: searchDescription,
            search_state: searchState
        },
        isJSON: true
    };

    try {
        const result = await ajaxUtility.ajaxCallAsync(option);
        
        if (result.msg === 'Success') {
            // Close modal
            const modal = document.getElementById('saved_search_item');
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
            
            // Clear form
            document.getElementById('search_name').value = '';
            document.getElementById('item_comments').value = '';
            
            flashMessage('Search saved successfully', 'success');
        } else {
            flashMessage('Failed to save search', 'danger');
        }
    } catch (error) {
        console.error('Failed to save search:', error);
        flashMessage('Failed to save search', 'danger');
    }
};

// Initialize save search functionality
const initializeSaveSearch = () => {
    // Get the save button from modal
    const saveButton = document.querySelector('#saved_search_item .modal-footer .btn-primary');
    if (!saveButton) return;

    // Remove existing event listeners
    saveButton.removeEventListener('click', saveCurrentSearch);
    
    // Add new event listener
    saveButton.addEventListener('click', saveCurrentSearch);
};

