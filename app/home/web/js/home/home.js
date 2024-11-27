$(document).ready(function() {
    loadRequestList();
});


function loadDashboard(data){
    let submit_count = 0;
    let draft_count = 0;
    $.each(data,function(_,ele){
        if (ele.request_progress=='Submitted'){
            submit_count += 1;
        }
        else if (ele.request_progress=='Draft'){
            draft_count += 1;
        }

    });
    $("#cnt_submitted").text(submit_count);
    $('#cnt_draft').text(draft_count);
}

function loadRequestList(){
    let user_id = $("#roleDropdown option:selected").attr('role-id');

    let option = { 
        url: '/api/get/item/request/list/', 
        method: "post", 
        data : {
            "user_id" : user_id //temp
        }
    };

    ajaxUtility.ajaxCall(option, function (res) {
        if (res.error) {
            flashMessage(res.msg, 'danger');
        }
        else{
            let data = res.data
            loadDashboard(data);
        }    
    }) 

}