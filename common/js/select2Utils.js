var UtilitySelect = (function() {

    // Cache to store fetched data based on URL and query params
    var cache = {};

    // Function to initialize select2 with options, requiring only baseurl and el
    var select2utility = async function({
        el, baseurl,
        data = {},
        id_field = "id",
        name_field = "name",
        drop_down_parent = null,
        method = 'POST',
        selected = [],
        default_selected = [], // Default selected values
        tags = false
    } = {}) {
        // Ensure baseurl and el are provided
        if (!el || !baseurl) {
            console.error("Error: 'el' and 'baseurl' are required parameters.");
            return;
        }

        try {
            // Append default selected options if provided
            if (default_selected && default_selected.length > 0) {
                default_selected.forEach(item => {
                    const option = new Option(item.text, item.id, true, true);
                    $(el).append(option);
                });
            }

            // Generate cache key based on URL and data
            const cacheKey = `${baseurl}_${JSON.stringify(data)}`;

            // Initialize select2 with settings
            $(el).select2({
                allowClear: true,
                placeholder: 'Select...',
                minimumResultsForSearch: 5,
                dropdownParent: drop_down_parent,
                tags: tags,
                language: {
                    noResults: function() {
                        return "No records found";
                    }
                },
                ajax: {
                    transport: function(params, success, failure) {
                        // Check if data exists in cache
                 
                            // Fetch data from server if not in cache
                            $.ajax({
                                url: baseurl,
                                dataType: 'json',
                                delay: 250,
                                type: method,
                                data: {
                                    ...data,
                                    search: params.data.term,
                                    page: params.data.page
                                }
                            })
                            .done(function(responseData) {
                                // Store the response in cache
                                cache[cacheKey] = responseData;
                                success(responseData);
                            })
                            .fail(function(xhr, status, error) {
                                console.error("Error during AJAX request:", status, error);
                                flashMessage("Data loading failed. Please try again later.", "warning");
                                failure(xhr);
                            });
                        
                    },
                    processResults: function(responseData, params) {
                        params.page = params.page || 1;
                        let results = responseData.data || [];

                        // Filter out selected items, if applicable
                        if (selected && selected.length) {
                            results = results.filter(item => !selected.includes(item[id_field]));
                        }

                        // Map results to select2 format
                        const formattedResults = results.length > 0 ? results.map(item => ({
                            id: item[id_field],
                            text: item[name_field]
                        })) : [];  // Show empty results if data is blank

                        return {
                            results: formattedResults,
                            pagination: {
                                more: (params.page * 10) < (responseData.data ? responseData.data.count_filtered : 0)
                            }
                        };
                    }
                },
                escapeMarkup: function(markup) {
                    return markup;
                }
            });

            // Trigger a change event to update select2 with selected values
            $(el).trigger('change');

        } catch (error) {
            console.error("Error initializing select2:", error);
        }
    };

    // Expose the function directly
    return {
        select2utility: select2utility
    };

})();
