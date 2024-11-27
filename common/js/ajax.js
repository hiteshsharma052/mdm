// Utility for making AJAX calls
const ajaxUtility = (() => {
    // Abort duplicate AJAX calls with the same identifier
    const abortDuplicateCall = (callVar) => {
        if (window[callVar] && callVar !== 'global_call') {
            window[callVar].abort();
            window[callVar] = "";
        }
    };

    // Default AJAX settings
    const defaultSettings = {
        async: true,
        method: "POST",
        dataType: "json",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        processData: true,
        cache: false,
    };



    // Set Loader
    const setLoader = (option) => {
        // for disable loader
        if (option.loader_disable) {
            return true;
        }
        loaderEnb = option.loader ? true : false;
        if (loaderEnb) {
            loader = (option.loader).split(" ");
            loaderHead = loader[0];
            loaderBody = loader[1];
            $('#' + loaderHead).block({
                message: '',
                // message: '<img src="/common/web/img/'+loaderBody.split("#")[1]+'.gif" />',
                //set loader exmpl parent div and child div "parent #loaderIn"
                loaderwrap: loaderHead + ' ' + loaderBody,
                css: { border: 'none', background: "none" }
            });
        } else {
            $('#body').block({
                // message: '<img src="/common/web/img/loader.gif" />',
                message: '',
                loaderwrap: 'body #loader',
                css: { border: 'none', background: "none" }
            });
        }
    };

    // Hide Loader
    const hideLoader = (option) => {
        loaderEnb = option.loader ? true : false;
        if (loaderEnb) {
            loader = (option.loader).split(" ");
            loaderHead = loader[0];
            loaderBody = loader[1];
            $('#' + loaderHead).unblock({ loaderwrap: loaderHead + ' ' + loaderBody });

        } else {
            $('#body').unblock({ loaderwrap: 'body #loader' });
        }
    };

    // AJAX Success Handler
    const handleSuccess = (result, option, callback) => {
        hideLoader(option);
        try {
            const parsedResult = typeof result === "string" ? JSON.parse(result) : result;

            if (parsedResult.error) {
                // Show error message if an error is indicated in response
                flashMessage(parsedResult.msg || 'Error encountered', 'danger');
                if (parsedResult.status === 403) {
                    createCookie("forbidden", "Please log in to access");
                    window.location.href = "/";
                }
                return callback(parsedResult);
            }
            // Call callback with result if no error
            callback(parsedResult);
        } catch (e) {
            flashMessage('Technical Error! Please Try Again.', 'danger');
            callback(null);
        }
    };

    // AJAX Error Handler
    const handleError = (result, option, callback) => {
        hideLoader(option);

        let message = 'An error occurred.';

        if (result.status === 400) {
            // Handling 400 Bad Request errors, including detailed error message
            try {
                const responseText = JSON.parse(result.responseText);

                if (responseText.message && typeof responseText.message === 'object') {
                    // Collect all error messages in new line format
                    message = Object.keys(responseText.message).map(field => {
                        const fieldErrors = responseText.message[field];
                        return fieldErrors.join("<br>"); // Join array messages with newline
                    }).join("<br>"); // Separate different fields with two newlines
                } else {
                    message = responseText.message || 'Bad Request';
                }
            } catch (e) {
                message = 'Invalid error format received.';
            }
            callback({ msg: message, error: 1 });
        } else if (result.status === 504) {
            callback({ msg: '504 Gateway Time-out', error: 1 });
        } else if (!result.status) {
            callback({ msg: 'Client Network Error', error: 1 });
        } else {
            callback({ msg: result.statusText || message, error: 1 });
        }
    };
    // Main AJAX Call
    const ajaxCall = (options, callback) => {
        const { ajax_call_var = 'global_call', loader, loader_disable, isJSON } = options;
        abortDuplicateCall(ajax_call_var);
        setLoader(options);

        // Start with default settings
        let ajaxOptions = { ...defaultSettings };

        // If isJSON flag is true, prepare JSON specific settings
        if (isJSON) {
            ajaxOptions = {
                ...ajaxOptions,
                contentType: 'application/json',
                processData: false,  // Important: prevent jQuery from processing the data
                data: JSON.stringify(options.data)
            };
        } else {
            // For non-JSON requests, use the data as is
            ajaxOptions = {
                ...ajaxOptions,
                data: options.data
            };
        }

        // Now merge with remaining options (but preserve our contentType and data settings for JSON)
        const { data, contentType, processData, ...remainingOptions } = options;
        if (isJSON) {
            ajaxOptions = {
                ...ajaxOptions,
                ...remainingOptions
            };
        } else {
            ajaxOptions = {
                ...ajaxOptions,
                ...options
            };
        }

        window[ajax_call_var] = $.ajax({
            ...ajaxOptions,
            beforeSend: () => setLoader(options),
            success: (result) => handleSuccess(result, options, callback),
            error: (result) => handleError(result, options, callback)
        });
    };
    // Promise-based AJAX Call
    const ajaxCallAsync = (options) => {
        return new Promise((resolve, reject) => {
            ajaxCall(options, (result) => {
                if (result && result.error) reject(result);
                else resolve(result);
            });
        });
    };

    return {
        ajaxCall,
        ajaxCallAsync,
    };
})();
