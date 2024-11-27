$(document).ready(function() {
    loadDictionaryDefinitionList();
});


function  renderDictDefinitionTable(data){
    let str_ = ``;

    $.each(data,function(_,ele){
        str_ += `
        <tr>
            <td class="tx-14 tx-bold tx-primary">${ele.dict_name}</td>
            <td>${ele.description}</td>
            <td>
                <div class="d-flex">
                <button class="btn btn-xs btn-secondary mg-r-10 shw_dict_kv d-flex" dict-name="${ele.dict_name}" dict-seq-no="${ele.dict_seq_no}" dict_def="${ele.description}" data-bs-toggle="modal"><i aria-hidden="true" class="mdi mdi-eye mg-r-5"></i> View</button>
                <a href="#edit_dict_value_brand" class="btn btn-xs btn-primary mg-r-10 creator superuser" data-bs-toggle="modal" style="display: none;"><i aria-hidden="true" class="mdi mdi-plus"></i> Add Value</a>
                </div>
            </td>
        </tr>
        
        `
    });
    $("#dict_definition_tbl").html(str_);
    $("#dictionaryTable").dataTable(
        { targets: 'no-sort', orderable: false 
    });
}




function loadDictionaryDefinitionList(){
    let option = { 
        url: '/api/dictionary/definition//list/', 
        method: "post", 
        data : {
        }
    };

    ajaxUtility.ajaxCall(option, function (res) {
        if (res.error) {
            flashMessage(res.msg, 'danger');
        }
        else{
            let data = res.data
            renderDictDefinitionTable(data);
        }    
    }) 
}


function setDataTable(){

    $("#previewDict").DataTable({
        "pageLength": 10,
        "scrollX": false,
        "columnDefs": [{ targets: 'no-sort', orderable: false }],
        lengthMenu: [
            [5, 10, 25, 50, -1 ],
            [5,10, 25, 50, 'All']
        ],
        drawCallback: function(dt) {
            $('.experience-jquerySelect2-tag').select2({tags: true, width: "6em"});
            $(".reportTag").select2({
            tags: true,
            separator: ",",
            });
        }
        
        });
        
}


function renderItemModal(data){

    let str_ = ``;

    $.each(data,function(_,ele){
        str_ += `
        <tr>
            <td>${ele.dict_code_primary}</td>
            <td class="tx-medium">${ele.dict_desc_primary}</td>
            <td class="superuser" style="display: none;">
            <a class="btn btn-xs btn-outline-secondary superuser" style="display: none;" href="#"><i class="mdi mdi-null"></i> Inactive</a>
            </td>
        </tr>
        `
    });
    $("#previewDictBdy").html(str_);

    setDataTable()

}

$("body").on("click", ".shw_dict_kv", function () {
    $("#previewDict").DataTable().destroy();

    let dict_name = $(this).attr('dict-name');
    let seq_no = $(this).attr('dict-seq-no');
    let definition = $(this).attr('dict_def');

    let option = { 
        url: '/api/dict/get/detail/', 
        method: "post", 
        data : {
            "dict_name" : dict_name,
            "dict_seq_no" :  seq_no
        }
    };

    ajaxUtility.ajaxCall(option, function (res) {
        if (res.error) {
            flashMessage(res.msg, 'danger');
        }
        else{
            $("#dict_kv_modal").modal('show');
            $("#dict_nme").text(dict_name);
            $("#dict_def").text(definition);
            let data = res.data;
            renderItemModal(data);
        }    
    }) 
})