$(function() {
    let def_wht_space = $.fn.tooltip.Constructor.Default.whiteList;
    let my_cust_rgx = /^action_[\w-]+/;
    if(def_wht_space){
        def_wht_space['*'].push(my_cust_rgx);
        def_wht_space['*'].push("onclick");
    }

    $("body").on('click', '.daas_logout_user', function() {
        eraseLocalStorage("access");
        window.location.href = "/logout";
    })

   $("body").on('change blur', '.remove_special_char_check', function() {
        const special_chars = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/; // Removed underscore (_) from the regex

        if (special_chars.test(this.value)) {
            flashMessage("Special characters are not allowed (except underscore)!","warning");
            this.value = this.value.replace(special_chars, '');
            this.focus();
        }
    });




    /***************************Remove Select2 Error Class *********************/
    $("body").on('change', '.slerror', function() {
        let err_id = $(this).attr('id');

        try {
            let val_ = $("#" + err_id).val();
            if (val_ != '') {
                $("#" + err_id + "-error").hide();
            }
        } catch (e) {

        }
    })

    /**Examples of malicious javascript**/
    $("body").on("change","input,textarea", function() {

        let inpt_val = $(this).val().trim();
        let patt1 = new RegExp("<scâ€‹ript");
        let patt2 = new RegExp("<script");
        let patt3 = new RegExp("<iframe");
        let patt4 = new RegExp("<ifâ€‹rame");
        if (patt1.test(inpt_val)) {
            $(this).val('');
        } else if (patt2.test(inpt_val)) {
            $(this).val('');
        } else if (patt3.test(inpt_val)) {
            $(this).val('');
        } else if (patt4.test(inpt_val)) {
            $(this).val('');
        } else {
            return true;
        }

    });
    $("body").on("click",".error-icon-show",function(){
        $(this).next(".msg_details").toggle();
    })
})


function getCurDate() {
        let nowDate = new Date();
        let date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
        return date
}
function getCurTime() {
        let today = new Date();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return time;
}

function checkArrays( arr_a, arr_b ){
    //check if lengths are different
    if(arr_a.length !== arr_b.length) return false;
    //slice so we do not effect the original
    //sort makes sure they are in order
    //join makes it a string so we can do a string compare
    let a = arr_a.slice().sort().join(",");
    let b = arr_b.slice().sort().join(",");
    return a===b;
}
function LowerCase(strData) {

    return strData.trim().toLowerCase();
}


function stripHtml(value) {
    // remove html tags and space chars
    return value.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
        // remove punctuation
        .replace(/[.(),;:!?%#$'"_+=\/\-]*/g, '');
}

function replaceSpacialChar(value,replace_with="_") {
    if(!emptyCheck(value)){
        let return_val =  value.toString().replaceAll(/[&\/\\#, +()$~%.'":*?<>{}]/g, replace_with);
        return return_val.replaceAll("_",replace_with);
    }else{
        return value;
    }
}

function replaceSpacialCharWithOutSpace(value,replace_with="_") {
    if(!emptyCheck(value)){
        return_val =  value.toString().replaceAll(/[&\/\\#,\\" +()$~%.'":*?<>{}]/g, replace_with);
        return return_val.replaceAll("_",replace_with);
    }else{
        return value;
    }
}

function removeNonASCII(str) {
    return replaceSpacialCharWithOutSpace(str.replace(/[^\x00-\x7F]/g, ""),"_");
}

function removeQuotesFromString(column_name) {
    if (!emptyCheck(column_name)) {
        // Remove both double and single quotes
        return column_name.toString().replace(/['"]/g, '');
    } else {
        return column_name;
    }
}
function formattedAttributesStr(column_name) {
    let col_qts = column_name.includes('"') ? "'" : '"';
    if (!emptyCheck(column_name)) {
        // Remove both double and single quotes
        return col_qts+column_name+col_qts;
    } else {
        return "'"+column_name+"'";
    }
}




setTimeout(function(){ checkLiveConnection() }, 100000);

function checkLiveConnection(){
     if(!navigator.onLine){
        flashMessage(`
                Lost connection to ScikIQ
                You appear to be offline or have a poor connection. Check your network and try again.`,'warning')
     }
}

function generateUUID(len=16) {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(len);
    });
}

function genUUIDSTR() {
    let text = "";
    let possible = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

function flashMessage(msg, classdata) {
    flashMessageNew(msg, classdata);
}

function DateFormatter(date,format="-") {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if(format == "/"){
        return [day, month,year].join(format);
    }else{
        return [year, month,day].join(format);
    }
}

function DateTimeFormatter(dateTime, format="-") {
    let dt = new Date(dateTime),
        year = dt.getFullYear(),
        month = '' + (dt.getMonth() + 1),
        day = '' + dt.getDate(),
        hours = '' + dt.getHours(),
        minutes = '' + dt.getMinutes(),
        seconds = '' + dt.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    if (seconds.length < 2) seconds = '0' + seconds;

    if(format == "/"){
        return [day, month, year].join(format) + ' ' + [hours, minutes, seconds].join(':');
    } else {
        return [year, month, day].join(format) + ' ' + [hours, minutes, seconds].join(':');
    }
}function flashMessageNew(msg, classdata) {
    let error_type = "";
    let custom_str = "";

    // Handle string or JSON structure for the message
    if (typeof msg === 'string') {
        custom_str = msg.trim(); // Trim any extra whitespace
    } else {
        if (msg["msg"]) {
            custom_str += msg["msg"];
        }

        // Add details for structured error messages in "message"
        if (!emptyCheck(msg["message"]) && typeof msg["message"] === "object") {
            custom_str += `<a class="error-icon-show" title="Read More">
                            <i class="mdi mdi-chevron-down mdi-18px lh-0 tx-white"></i>
                          </a>`;

            // Start detailed error message section
            custom_str += `<div class="msg_details overflow-auto scikiq-flash-msg" style="display: none; max-height:150px">`;

            // Loop over each error field and its messages
            for (const [field, messages] of Object.entries(msg["message"])) {
                if (!emptyCheck(field)) {
                    custom_str += `<strong>${field}:</strong><br>`;
                    messages.forEach((errorMsg) => {
                        custom_str += `<div>- ${errorMsg}</div>`;
                    });
                }
            }

            custom_str += `</div>`;
        }
    }

    // Check if the message is empty, and if so, do not show the notification
    if (!custom_str) {
        return;
    }

    // Determine the error type and set sound based on classdata
    switch (classdata) {
        case "danger":
        case "warning":
            error_type = classdata;
            new Audio('/common/img/alert.mp3').play();
            break;
        case "info":
            error_type = "info";
            new Audio('/common/img/success.mp3').play();
            break;
        default:
            error_type = "success";
            new Audio('/common/img/success.mp3').play();
    }

    // Display notification with constructed message
    $.notify(`<div>${custom_str}</div>`, {
        allow_dismiss: true,
        type: error_type,
        placement: {
            from: 'bottom',
            align: 'right'
        }
    });

    // Toggle error details display on click
    $(document).on('click', '.error-icon-show', function() {
        $(this).next('.msg_details').toggle();
    });
}



function removeLastComma(str) {
    let n = str.lastIndexOf(",");
    let a = str.substring(0, n)
    return a;
}


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}


function isEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function activaTab(tab) {

    $('a[href="#' + tab + '"]').tab('show');
};

function convertTimestampToDateTime(timestampString) {
  // Remove the last 3 digits (milliseconds) from the timestamp
  const timestamp = parseInt(timestampString.slice(0, -3));

  // Create a new Date object from the timestamp
  const dateObj = new Date(timestamp);

  // Extract the date and time components
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  // Format the date and time string
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

  return formattedDateTime;
}
function createCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }

    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    let name_eq = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(name_eq) == 0) return c.substring(name_eq.length, c.length);
    }
    return null;
}


function arrayClean(thisArray, thisName) {
    return thisArray.filter( function( item ) {
        return item.name != thisName;
    });
}



function eraseCookie(name) {
    createCookie(name, "", -1);
}

function readUserData() {
    try {
        let usr_data = readCookie('user');
        return JSON.parse(usr_data);
    } catch (e) {
        return [];
    }
}
// for show default forbidden msg if inside cookies
if (readCookie('forbidden')) {
    let msg = readCookie('forbidden');
    flashMessageNew(msg, 'warning');
    eraseCookie('forbidden');
}

// for show default success msg if inside cookies
if (readCookie('success')) {
    let msg = readCookie('success');
    flashMessageNew(msg, 'success');
    eraseCookie('success');
}

/**************************************************
 * Numeric Data Only Enter
 **************************************************/
$("body").on('keypress', '.numeric', function(e) {
    //$(this).attr("maxlength","8");
    //if the letter is not digit then display error and don't type anything
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        return false;
    }

});

function encodeData(id_data) {
    return btoa(id_data);
}

function decodeData(id_data) {
    return atob(id_data);
}

function isInArray(value, array) {
    try {
        return array.indexOf(value) > -1;
    } catch (e) {
        return 1
    }
}
//if array key is not found
function isInArrayNon(value, array) {
    try {
        return array.indexOf(value) > -1;
    } catch (e) {
        return 0
    }
}



function getCheckPermissionByData(resource_type, action) {
    const access = getLocalStorage('access');
    if (!access) return false;
    try {
        let read_rbc = access;
        let query_data = JSON.parse(read_rbc);
        let get_data = query_data['permission'];
        let get_data_resource = get_data[resource_type];
        let get_data_resource_id = get_data_resource;
        return isInArray(action, get_data_resource_id)
    } catch (e) {
        return false;
    }
}

/*remove element from array*/
function removeFrmArray(array, element) {
    return array.filter(e => e !== element);
};

function getCheckPermission(type, action) {
     const access = getLocalStorage('access');
    if (!access) return false;
    try {
        let read_rbc = access;
        let query_data = JSON.parse(read_rbc);
        let get_data = query_data['menu'];
        let get_data_resource = get_data[type];
        return isInArrayNon(action, get_data_resource)
    } catch (e) {
        return false;
    }
}

function getCheckPermissionEntity(arrEntity, action) {
    return true;
}


function setLocalStorage(name, value) {
    if (name) {
        localStorage.setItem(name, value);
    }
}

function getLocalStorage(name) {
    if (name != "" && localStorage.getItem(name) !== null) {
        return localStorage.getItem(name);
    }
}

function eraseLocalStorage(name) {
    if (name != "" && localStorage.getItem(name) !== null) {
        localStorage.removeItem(name);
    }
}

function reloadJs(src) {
    src = $('script[src$="' + src + '"]').attr("src");
    $('script[src$="' + src + '"]').remove();
    $('<script/>').attr('src', src).appendTo('body');
}


/*#############################################################################################
# Desc : makeEmptyDiv function used to remove all data base on ID.
# Param : None
# Return Value  :None;
#############################################################################################*/
function makeEmptyDiv(div_id) {
    $("#" + div_id).empty();
}

function getAllKeysList(obj) {
    return Object.keys(obj);
}

function getAllValuesList(obj) {
    return Object.values(obj);
}
/*#############################################################################################
# Desc :contructData function used to convert list of dictonaries data to list of value(Column label)
# Return Value  :tempData :dictonaries(Key-> column name,value-> list of values);
#############################################################################################*/
function contructData(data, columnList) {
    let get_data = jsonQ(JSON.parse(data));
    let temp_data = {}
    $.each(columnList, function(key, d) {
        let data_get = get_data.find(d);
        temp_data[d] = data_get.value();
    })
    return temp_data;
}


function contructDataSalesDashboard(data, columnList) {
    let get_data = jsonQ(data);
    let temp_data = {}
    $.each(columnList, function(key, d) {
        let data_get = get_data.find(d);
        temp_data[d] = data_get.value()
    })
    return temp_data
}



function isInt(n) {
    return typeof n == 'number' && Math.Round(n) % 1 == 0;
}
function submitVirtualForm(url, dictData, new_tab = false, file_id = "") {
    let form = $('<form>', {
      'method': 'POST',
      'id': 'submitVirtualForm',
      'action': url,
      "enctype": "multipart/form-data"
    });
  
    if (new_tab) {
      form.attr('target', '_blank');
    }
  
    $.each(dictData, function(key, data) {
      form.append($('<input>', {
        'type': 'hidden',
        'name': key,
        'value': data
      }));
    });
  
    if (!emptyCheck(file_id)) {
      let file_input = $("#" + file_id)[0];
      let files = file_input.files;
  
      // Create a new DataTransfer object
      let dataTransfer = new DataTransfer();
  
      // Append each file to the DataTransfer object
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        dataTransfer.items.add(file);
      }
  
      // Create a file input element and assign the files from the DataTransfer object
      let file_input_element = $('<input>', {
        'type': 'file',
        'name': 'file',
        'multiple': true
      });
      file_input_element[0].files = dataTransfer.files;
  
      // Append the file input element to the form
      form.append(file_input_element);
    }
  
    form.appendTo('body').submit().remove();
  }

function submitVirtualFormOpner(url, dictData, new_tab = false) {
    let create_form = "<form enctype='multipart/form-data' method='POST' id='submitVirtualForm' action='" + url + "' " + (new_tab ? "target='ScikiqWindow'" : '') + " >";
    $.each(dictData, function(key, data) {
        create_form += "<input name='" + key + "' value='" + data + "'>";
    })
    create_form += "</form>";

    let virtual_form = $(create_form).appendTo('body')
    window.open('', 'ScikiqWindow');
    virtual_form.submit().remove();
}


function check_required_inputs(form_id, callback) {
    let i = 0
    let len_inp = $('#' + form_id).find('input,select,textarea').length;
    let req_ck = true
    $('#' + form_id).find('input,select,textarea').each(function() {
        if ($(this).prop('required') && $(this).val() == "") {
            req_ck = false;
        }
        i++;
        if (len_inp == i) {
            callback(req_ck)
            return false;
        }
    });
}

function changeUrlOnLoad () {
    let random_num = Math.floor((Math.random() * 100) + 1);
    let path_name = window.location.pathname;
    let search = window.location.search;
    let address_url = path_name + search + "&ar=" + random_num;
    window.location.href = address_url;
}

function emptyCheck(value){
    return !(!!value ? typeof value === 'object' ? Array.isArray(value) ? !!value.length : !!Object.keys(value).length : true : false);
}

function numberWithThousandCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/*--added new plugin for disable field data get ---*/
(function ($) {
  $.fn.serializeAllArray = function () {
    let obj = [];

    $('input, select, textarea',this).each(function (e, i) 
    {
        if(this.type == "radio"){
            if($(i).prop("checked"))
                obj.push({name: this.name, value: $(this).val()});
        }else{
            obj.push({name: this.name, value: $(this).val()});
        }

    });
    return obj;
  }
})(jQuery);


/* -----------------------------------------------------------
* loadDataSelect
*-------------------------------------------------------------*/
function loadDataSelect(div_id, data, cols){
    let items = []
    $.each(data,function(i,k){
        items.push({ id: k[cols["key"]], text : k[cols["value"]]})
    })
    
    let pageSize = 50;

    jQuery.fn.select2.amd.require(["select2/data/array", "select2/utils"],function (ArrayData, Utils) {
        function CustomData($element, options) {
            CustomData.__super__.constructor.call(this, $element, options);
        }
        Utils.Extend(CustomData, ArrayData);

        CustomData.prototype.query = function (params, callback) {
            let results = [];
            if (params.term && params.term !== '') {
                results = _.filter(items, function(e) {
                    return e.text.toUpperCase().indexOf(params.term.toUpperCase()) >= 0;
                });
            } 
            else {
                results = items;
            }

            if (!("page" in params)) {
                params.page = 1;
            }
            let data = {};
            data.results = results.slice((params.page - 1) * pageSize, params.page *pageSize);
            data.pagination = {};
            data.pagination.more = params.page * pageSize < results.length;
            callback(data);
        };

        $("#"+div_id).select2({
            ajax: {},
            dataAdapter: CustomData
        });
    })
}

function getModulePermission(mod_per){
    return (ALLOW_MODULES.includes("*") || ALLOW_MODULES.includes(mod_per))
}

function formatToTwoDecimalPlaces(input) {
    try{
        let num = parseFloat(input);
        if (Math.abs(num) < 1e-2 && num !== 0) {
            return num.toPrecision(2);
        }
        let formatted_num = num.toFixed(2);
        return formatted_num
    }
    catch{
        return input
    }
}
function placeHolderLoader(){
     let place_holder_div = `<div class="placeholder-paragraph">
                    <div class="line"></div>
                    <div class="line"></div>
                </div>`;
     return place_holder_div;
}