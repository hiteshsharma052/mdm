
// Get LasstModified Difference in Days,Hours
let getLastModifiedDaysHours = (updatedDate) => {
  let date1 = new Date(); 
  let date2 = new Date(updatedDate); 
  let Difference_In_Time = date1.getTime() - date2.getTime(); 
  let Difference_In_Days = Math.round(Difference_In_Time / (1000*3600*24), 0) ;
  if(!Difference_In_Days)
      return date1.getHours() - date2.getHours()+ ' Hours ago'
  return  Difference_In_Days + ' Days ago'
}

/*#############################################################################################
# Desc : shortText function used to add '...' after given lenght in string.
# Param : str:- current value,Type-String,length:- length of string after add three dot,Type-Int
# Return Value : toset:- after operation string.
#############################################################################################*/
function shortTextLngth(str, strt_lngth, end_lngth=5) {
  var toset = str;
  if (str.length > strt_lngth) {
    toset = str.substring(0, strt_lngth) + '...'+ str.substring(str.length-end_lngth, str.length);
    // name.substring(0,10)+"..."+name.substring(name.length-5, name.length)
    checkTickValueLenght_Flag = true
  }
  return toset
}

let convertLstToShortText = (lst,lnth=12,end_lngth=3) => {
  let newList = []
  $.each(lst, function (i, v) {
    let value  =  v == undefined ? 'undefined': v.toString();
    newList.push(shortTextLngth(value, strt_lngth=lnth,end_lngth=end_lngth))
  });
  return newList
}



function getIndianFormat(str) { 
  str = ""+str
  str = str.split(".");
  return str[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,") + (str[1] ? ("."+str[1]): "");
 }



function thousandSeperator(nStr) {
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}




function copyToClipboard(divId, button) {
  // Get the text content of the div element
  const divText = document.getElementById(divId).innerText;

  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = divText;
  document.body.appendChild(textarea);

  // Select the text in the textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text to the clipboard
  document.execCommand('copy');

  // Remove the temporary textarea
  document.body.removeChild(textarea);

  // Show tooltip
  const tooltip = createTooltip();
  showTooltip(tooltip, 'Text copied!');
  button.parentNode.appendChild(tooltip);
  setTimeout(function () {
    hideTooltip(tooltip);
  }, 1000);
}

/**
 * Accepts either a URL or querystring and returns an object associating
 * each querystring parameter to its value.
 *
 * Returns an empty object if no querystring parameters found.
 */
function getUrlParams(urlOrQueryString) {
  if ((i = urlOrQueryString.indexOf('?')) >= 0) {
    const queryString = urlOrQueryString.substring(i+1);
    if (queryString) {
      return _mapUrlParams(queryString);
    }
  }

  return {};
}

/**
 * Helper function for `getUrlParams()`
 * Builds the querystring parameter to value object map.
 *
 * @param queryString {string} - The full querystring, without the leading '?'.
 */
function _mapUrlParams(queryString) {
  return queryString
    .split('&')
    .map(function(keyValueString) { return keyValueString.split('=') })
    .reduce(function(urlParams, [key, value]) {
      if (Number.isInteger(parseInt(value)) && parseInt(value) == value) {
        urlParams[key] = parseInt(value);
      } else {
        urlParams[key] = decodeURI(value);
      }
      return urlParams;
    }, {});
}

let convertMinutes =(minutes) => {
  if(minutes <60) return minutes + ' Minutes';
  if(minutes >=60) return Math.floor(minutes/60) + ' Hours '+ (minutes%60).toFixed(2) + ' Minutes';
}

function isValidName(str) {
  // Regular expression to match strings containing at least one alphabet character and consisting only of alphanumeric characters, underscores, and periods
  var regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9 _.]+$/
  
  return regex.test(str);
}

function removeSpaces(str) {
  if(!emptyCheck(str)){
    return str.replace(/\s/g, "").toLowerCase();
  }
  return str;

}

// *----------------------------------------------------------*
              // Text Truncate and tooltips
// *----------------------------------------------------------*
$.fn.tooltipOnOverflow = function(options) {
  $(this).on("mouseenter", function() {

    if (this.offsetWidth < this.scrollWidth) {
      options = options || { placement: "auto"}
      // Ensure the tooltip is initialized before trying to dispose of it
      try{
        $(this).tooltip("dispose");
      }catch(e){}
      options.title = $(this).text();
      $(this).tooltip(options);
      $(this).tooltip("show");
    } else {
      if ($(this).data("bs.tooltip")) {
        $tooltip.tooltip("hide");
        $tooltip.removeData("bs.tooltip");

      }
    }
  });
};
// *----------------------------------------------------------*
              // Text Truncate and tooltips
// *----------------------------------------------------------*
$(document).ready(function () {
  // Check if breadcrumb data exists in localStorage
  const breadcrumbData = JSON.parse(localStorage.getItem('breadcrumb'));
  if (breadcrumbData) {
    // Update breadcrumb if data is found
    $('.breadcrumb-label').text(breadcrumbData.parentLabel);
    $('.breadcrumb-current').text(breadcrumbData.currentText).attr('aria-current', 'page');
    // Add the saved icon to the breadcrumb
    $('.breadcrumb-icon').html(breadcrumbData.icon); 
  }

  // Handle menu click events
  $('.nav-item a').on('click', function (e) {
    e.preventDefault();

    // Get clicked item's text, URL, and icon
    let currentText = $(this).find('span').text();
    let currentUrl = $(this).attr('href');
    let iconHtml = $(this).find('i').prop('outerHTML'); // Get the icon HTML

    // Get parent label
    let parentLabel = $(this).closest('li').prevAll('.nav-label').first().text();

    // Update breadcrumb
    $('.breadcrumb-label').text(parentLabel);
    $('.breadcrumb-current').text(currentText).attr('aria-current', 'page');
    // Add the icon to the breadcrumb
    $('.breadcrumb-icon').html(iconHtml);

    // Save breadcrumb data to localStorage including the icon
    const breadcrumbData = { parentLabel, currentText, currentUrl, icon: iconHtml };
    localStorage.setItem('breadcrumb', JSON.stringify(breadcrumbData));

    // Optionally navigate to the URL
    window.location.href = currentUrl;
  });
});
