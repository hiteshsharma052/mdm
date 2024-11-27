function successMsg(message) {
    return `<div class="alert alert-success fade in alert-dismissable" style="margin-top:18px;">
    <strong>Success!</strong> ` + message + `
</div>
   `;
}

function errorMsg(message) {
    let msg = `<div class="alert alert-danger fade in alert-dismissable" style="margin-top:18px;">
    <strong>Error!</strong> ` + message + `
</div>
   `;
    return msg;
}

function scikiqAlert(config, callback = () => {}) {
    $("#dynamicModal").html("");
    let getDynamic = `<div class="modal fade scikiq-alert-` + ((config['type']) ? config['type'] : 'success') + `" id="dynamicBox" role="dialog" data-bs-backdrop="static" data-bs-keyboard="false">
              <div class="modal-dialog modal-sm role="document"">
                <div class="modal-content">
                  <div class="modal-header">
                  <h6 class="modal-title" id="alertModalMsgHeader">` + config.header + `</h6>
                  <!--<button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"> <span aria-hidden="true">×</span></button>-->
                  </div>
                  <div class="modal-body">                    
                    <p id="alertModalMsg">` + config.msg + `</p>
                  </div>
                  <div class="modal-footer">`;
    let i=0
    let btn_cls = ['btn-primary',' btn-secondary', 'btn-white', 'btn-success']
    $.each(config.button, function (key, value) {
        getDynamic += `<button type="button" class="alertModalDyn btn `+btn_cls[i]+`" data-act="` + value + `" data-bs-dismiss="modal">` + key + `</button>
                  `;
                  i++;
    })
    getDynamic += `</div>
                </div>
              </div>
            </div>`;
    $("#dynamicModal").html(getDynamic);
    // botstrap5 changes
    var notif_modal = new bootstrap.Modal($('#dynamicBox'), {
      keyboard: false
    })
    notif_modal.show();
    $("body").off('click', ".alertModalDyn").on('click', ".alertModalDyn", function () 
    {
        let getAction = $(this).attr("data-act");
        callback(getAction);
        return true;
    });
}

function notificationBox(callback) {
    var notif_modal = new bootstrap.Modal($('body #myModal'), {
      keyboard: false
    })
    notif_modal.show();
    var checkEvent = 1;
    $("body").on("click", ".alertModal", function () {
        
        if (checkEvent == 1) {
            checkEvent = 2;
            var getAction = $(this).attr("data-act")
            if (getAction == "no") {
                callback(2);
                return true;
            } else {
                callback(1);
                return true;
            }
        }
    })
}


function notificationWelcomeBox(custoMsg, callback) {
    $("#welcome_message").html(custoMsg)
    var notif_modal = new bootstrap.Modal($('body #welcomeAlert'), {
      keyboard: false
    })
    notif_modal.show();
    var checkEvent = 1;



    $("body").on("click", ".alertModal", function () {
        if (checkEvent == 1) {
            checkEvent = 2;
            var getAction = $(this).attr("data-act")
            if (getAction == "no") {
                callback(2);
                return true;
            } else {
                callback(1);
                return true;
            }

        }
    })


}


function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}