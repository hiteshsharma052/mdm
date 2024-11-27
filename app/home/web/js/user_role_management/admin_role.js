
/*----------------------------------------------------------------------------------
* getRoleUserList old function
-----------------------------------------------------------------------------------*/
let getRoleUserList = () => {
  var option = {
    url: "/api/user/list/",
    method: "post"
  };

  ajaxCall(option, function (response, error) {
    if (error) {
      flashMessage(response, 'danger')
    } else {
      response = response.data
      var str = `<select class="form-control selected_user" name="user_list[]" id="selected_user" multiple="multiple" placeholder="select user">`
      $.each(response, function (key, val) {
        str += `<option id="` + val['id'] + `" value="` + val['resource_key'] + `" class="select_user" > ` + val['first_name'] + ` ` + val['last_name'] + `</option>`
      })
      str += ` </select>`
      $('#role_user_list').html(str);

      $('.selected_user').select2({
        placeholder: "Select User",
      });

      // edit page options
      let roleid = $('#roleId').val(); 
      if (roleid){
        setRoleDetail(roleid)
      }
    }
  })
}

let user_selected = []
var menu_permission ;

/*----------------------------------------------------------------------------------
* getMenuPermissionUI
-----------------------------------------------------------------------------------*/
function getMenuPermissionUI(res){
  let headStrt = `<tr><th>Category</th><th>Menu</th><th>Sub-Menu</th> `
  let headEnd = `</tr>`
  let headMid = ''

  headMid += `<th>Display</th>`

  let Thead = headStrt + headMid + headEnd
  $("#head_role").html(Thead)

  let cat_wise_obj = group_by_field(res.menu,'Category')
  let body_str = ''
  $.each(cat_wise_obj,function(cat,cat_row){
    let menu_wise_obj = group_by_field(cat_row,'Menu')
    const cat_row_merge = cat_row.length
    let curr_cat = cat
    $.each(menu_wise_obj,function(men,men_row){
      const men_row_merge = men_row.length
      let curr_menu = men
      $.each(men_row,function(i,sub_men){
        body_str +=`<tr>`
        if (i==0 && curr_cat==cat){body_str +=`<td class="categories-column" rowspan="${cat_row_merge}">` + cat + `</td>`}
        else{body_str+=''}
        if (i==0 && curr_menu==men ){ body_str +=`<td class="menu-column" rowspan="${men_row_merge}">` + men + `</td>`}
        else{body_str+=''}

        body_str +=`<td class="sub-menu-column">` + sub_men['Sub-Menu'] + `</td>`

        let per = ''
        per += `<td class="categories-column">
                  <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input checkPermissionRole" 
                      menu=` + sub_men["id"] +  ` id="mnu_` + sub_men["id"]  + `" 
                      name="mnu_` + sub_men["id"] + `"  />
                  <label class="custom-control-label" for="mnu_` + sub_men["id"] + `"></label>
                  </div>
              </td>`
        body_str += per + `</tr>`
        curr_cat = ''
        curr_menu = ''
      })    
    })
    
  })
  $("#body_role").html(body_str)

  $.each(res.menupermission, function (j, k) {
    $.each($('.checkPermissionRole'), function (i, v) {
      let menu_id = $(v).attr('menu')
      if (k["menu"] == menu_id ) {
        $(v).removeAttr('disabled')
      } 
    })
  });  
}

// When the document is ready
$(document).ready(function () {
  // Attach a change event listener to the 'Select All' checkbox
  $('#menu-selectAllColumns').change(function () {
    $('#tblMenuPermission tbody .checkPermissionRole').prop('checked', this.checked);
  });

  // If any individual checkbox is unchecked, also uncheck the 'Select All' checkbox
  $('#tblMenuPermission tbody').on('change', '.checkPermissionRole', function () {
    updateSelectAllCheckbox();
  });
  
  // Event handler for clicking the edit button
  $('#role').click(function () {
    updateSelectAllCheckbox();
  });


  // Event handler for clicking the 'viewRole' button
  $('#role').on('click', '.role_view', function () {
    // Disable the 'Select All' checkbox
    $('#menu-selectAllColumns').prop('disabled', true);
  });

  // Event handler for clicking the 'edit' button to re-enable 'Select All'
  $('#role').on('click', '.role_edit', function () {
    // Re-enable the 'Select All' checkbox when editing
    $('#menu-selectAllColumns').prop('disabled', false);
  });


  // Function to update the 'Select All' checkbox based on sub-checkboxes
  function updateSelectAllCheckbox() {
    let allChecked = $('#tblMenuPermission tbody .checkPermissionRole:checked').length === 
                     $('#tblMenuPermission tbody .checkPermissionRole').length;
    $('#menu-selectAllColumns').prop('checked', allChecked);
  }
});


/*----------------------------------------------------------------------------------
* getRoleTypeList
-----------------------------------------------------------------------------------*/
let getRoleTypeList = () => {
  var option = {
    url: "/admin/role/list/",
    method: "post"
  }

  ajaxCall(option, function (response) {
    if (response.error) {
      flashMessage(response.msg, 'danger')
    } else {
      menu_permission = response
      getMenuPermissionUI(menu_permission)
    }
  })
}

function group_by_field(list_of_dict,grp_field){
  let cat_res = {}
  $.each(list_of_dict, function (i, v){
    if (v[grp_field] in cat_res){cat_res[v[grp_field]].push(v)}
    else{cat_res[v[grp_field]]=[v]}
  })
  return cat_res
}

/*----------------------------------------------------------------------------------
* Create createRl
-----------------------------------------------------------------------------------*/
$("body").on("click", "#createRl", function () {
  $("#create_role").modal("show");
  $('#role_user_list').val('');
  $('#roleId').val(''); // reset the role id when create new role 
  $('#role_name').val('');
  $('#role_name').prop("disabled", false);
  $('#role_description').val('');
  $('#role_description').prop("disabled", false);

  $.each($('.checkPermissionRole'),function(i,v){
    $(v).attr("checked", false);
    $(v).prop("disabled", false);
  })

  $.each($(".clsResourcePolicy"),function(i,v){
    $(v).attr("checked", false);
    $(v).prop("disabled", false);
  })

  $.each($('.resource-type-cnt'),function(i,v){
    $(v).attr('data-cnt',0);
    $(v).text("( 0 Selected )");
  })

  $('#role_create_btn').prop("disabled", false)

  role_key = ""
})

/*----------------------------------------------------------------------------------
* Create New Role
-----------------------------------------------------------------------------------*/
$('body').on("click", "#role_create_btn", function () {
  roleid = $('#roleId').val()
  if (!$('#createrole').valid()) {
    return false
  }
  let rl_name = $("#role_name").val();
  let rl_desc = $("#role_description").val();
  if(/[^0-9a-zA-Z_ ]/.test(rl_name)) {
          flashMessage("Only alphanumeric characters are allowed", 'warning');
          $("#role_name").focus();
  }else{    
    if(/[^0-9a-zA-Z_ ]/.test(rl_desc)) {
          flashMessage("Only alphanumeric characters are allowed", 'warning');
          $("#role_description").focus();
  }else{
      $(".select_user:checked").each(function () {
      let val = $(this).val();
        user_selected.push(val)
      })
      if(roleid){
        var option = {
          url: "/api/role/edit/",
          method: "post",
          data: {"rol_id": roleid}
      }}
      else{
      var option = {
        url: "/api/role/create/",
        method: "post"
      }
    }
    let len = $(".clsResourcePolicy").length

      let role_permissions = []
      for (let i = 0; i < len; i++){
        let parent_index = $($(".clsResourcePolicy")[i]).attr("parent-index")
        let permission_id = $($(".clsResourcePolicy")[i]).attr("parent-id")
        let privilege_id = $($(".clsResourcePolicy")[i]).attr("privilege-id")
        let object_name = $($(".clsResourcePolicy")[i]).attr("object-name")
        let action_name = $($(".clsResourcePolicy")[i]).attr("action-name")
        let resource_type_id = $($(".clsResourcePolicy")[i]).val()

        let id = $($(".clsResourcePolicy")[i]).attr("id")
        let checked = $('#'+ id).is(":checked")

        let r_permission = {}
        r_permission["permission_id"] = permission_id
        r_permission["resource_type_id"] = resource_type_id
        r_permission["privilege_id"] = privilege_id
        r_permission["checked"] = checked
        r_permission["object_name"] = object_name
        r_permission["action_name"] = action_name
        
        role_permissions.push(r_permission)
      } 

      let data = $('#createrole').serializeArray();

      let menuData = {}
      $.each($('.checkPermissionRole'), function (i, v) {
      let menu_id = $(v).attr('menu')

        if ($(v).prop('checked')) {
          display = 1  
        }else{
          display = 0
        }

        menuData[menu_id] = display
      })

      // user details
      data.push({
        name: "user_selected",
        value: user_selected
      })

      // menu permissions
      data.push({
        "name": "menu_permissions",
        value: JSON.stringify(menuData)
      })

      // role permissions
      data.push({
        "name" : "role_permissions",
        "value" : JSON.stringify(role_permissions) 
      })

      let menu_checked = Object.values(menuData).reduce((a, b) => a + b, 0)
      let rp_checked = 0
      $.each(role_permissions,function(i,v){rp_checked+=v['checked']})

    if(!menu_checked){flashMessage('Menu Permission not selected', 'danger')}
    else if(!rp_checked){flashMessage('Policies not selected', 'danger')}
    else{
      option["data"] = data
      ajaxCall(option, function (response, error) {
        if (response.error) {
          flashMessage(response.msg, 'danger')
        } else {
          flashMessage(response.msg, "success");
          location.reload();
        }
      })
      $("#create_role").modal("hide")
    }  
}}
})
/*----------------------------------------------------------------------------------
* Delete Role
-----------------------------------------------------------------------------------*/
$("body").on("click", "#deleteRole", function () {
  let $this = $(this)
 notificationBox(function (data) {
    if (data == 1) {
      var id = $this.attr('attr-id')
      var option = {
        url: "/api/role/delete/",
        method: "post",
        data: {
          'id': id
        }
      }
      ajaxCall(option, function (response, error) {
        if (response.error) {
          if (response.msg == 'Error') {
            flashMessage(response.msg, 'danger')
          } else {
            flashMessage(response.msg, 'warning')
          }
          $('body #myModal').modal('hide');
        } else {
          $('body #myModal').modal('hide');
          flashMessage(response.msg, 'success');
          rolTable.row($this.parents('tr')).remove().draw(false);
        }
      })
    }
  })
})


/*----------------------------------------------------------------------------------
* role edit
-----------------------------------------------------------------------------------*/
$("body").on("click", "#rl_edit", function () {
  $("#create_role").modal("show")
  $("#create_role").attr("attr-id", $(this).attr("attr-id"))
  
  getMenuPermissionUI(menu_permission)
  createRoleResourceTypePermission(permissionData)
  
  let role_key = $(this).attr("attr-id")  
  setRoleDetail(role_key, false)

  $('#roleId').val(role_key)
  
})


/*----------------------------------------------------------------------------------
* role edit
-----------------------------------------------------------------------------------*/
$("body").on("click", ".role_view", function () {
  $("#create_role").modal("show")
  $("#create_role").attr("attr-id", $(this).attr("attr-id"))

  getMenuPermissionUI(menu_permission)
  createRoleResourceTypePermission(permissionData)

  let role_key = $(this).attr("attr-id")  
  setRoleDetail(role_key, true)

  $('#roleId').val(role_key)
  
})


/*----------------------------------------------------------------------------------
* setRoleDetail
-----------------------------------------------------------------------------------*/
function setRoleDetail(roleid, disabled) {
  var option = {
    url: "/api/role/detail/",
    method: "post",
    data:{'id': roleid},
  }
  ajaxCall(option, function(response) {
      if (response.error) {
          flashMessage(response.msg, 'danger')
      } else {
          // disable all menu, enable if required.
          $(".checkPermissionRole").attr("disabled", true);
          let res = response.data['role_detail']
          let menu_per = response.data['menu_permissions']          
          let resource_per = response.data['resource_type_permissions'] 
          let rol_id=res[0]["id"]
          $("#role_name").val(res[0]["display_name"])
          $("#role_description").val(res[0]["description"])

          $("#role_name").attr("disabled", disabled)
          $("#role_description").attr("disabled", disabled)
          $("#role_create_btn").attr("disabled", disabled)
          
          for(i = 0; i < menu_per.length; i++) {
            let menu_id = menu_per[i].menu  
            let display = menu_per[i].display
            if(display == 1)
              $('#mnu_'+menu_id).attr("checked", true)
            else 
              $('#mnu_'+menu_id).attr("checked", false)

            $('#mnu_'+menu_id).attr("disabled", disabled);              
          }

          for(i = 0; i < resource_per.length; i++) {
            let privilege = resource_per[i].privilege  
            let active = resource_per[i].active
            if(active == 1){
              $('#policy-'+privilege).attr("checked", true)

              // Code to updated selected permission count
              parent_index = $('#policy-'+privilege).attr("parent-index")
              data_cnt = $('#spnResourceTypeCnt' + parent_index).attr("data-cnt")
              current_cnt = parseInt(data_cnt) + 1
              $('#spnResourceTypeCnt' + parent_index).attr("data-cnt", current_cnt)
              $('#spnResourceTypeCnt' + parent_index).html("(" + current_cnt + " selected)")
            }
            else 
              $('#policy-'+privilege).attr("checked", false)

            //$('#policy-'+privilege).trigger("click")   
            $('#policy-'+privilege).attr("disabled", disabled);              
          }          
      }
  })
}

var permissionData;

/*----------------------------------------------------------------------------------
* createRoleResourceTypePermission
-----------------------------------------------------------------------------------*/
function createRoleResourceTypePermission(permissionData){
  let strHTML = ""
  Object.keys(permissionData).forEach(function(key, index){
    if (permissionData["add"]["permission_id"].length > 0)
    {
      data = permissionData[key]
      display_name = data["permission_display_name"][0]
      name = data["permission_name"][0]
      id = data["permission_id"][0]

      let optionsHtml = ""
      
      for(i = 0; i < data["permission_id"].length; i++ ){
        optionsHtml += '<div class="checkbox"> \
            <input type="checkbox" class="clsResourcePolicy" action-name="'+ name +'" object-name="'+ data["resource_name"][i] +'" privilege-id="'+ data["privilege_id"][i] +'"  parent-index="'+ index +'" parent-id="'+ id +'" id="policy-'+ data["privilege_id"][i] +'" value="'+ data["resource_type_id"][i] +'">\
            <label for="policy-'+ data["privilege_id"][i] +'">'+ data["resource_display_name"][i] +'</label>\
        </div>'
      }

      strHTML += '<div class="card"> \
          <div class="card-header d-flex pd-y-10 collapsed" data-bs-toggle="collapse" data-parent="#cheadingOneC" data-bs-target="#collapseRT'+ index +'" aria-expanded="false">     \
              <span class="accicon"><i aria-hidden="true" class="fa fa-angle-right rotate-icon"></i></span>\
              <span class="title">\
                  <div class="custom-control custom-checkbox">\
                        <input type="checkbox" class="form-check-input select-all" id="chkSelectAll'+ index +'" name="select_all_'+ name +'">\
                        <label class="form-check-label" for="chkSelectAll'+ index +'">' + display_name + '</label>\
                  </div>                        \
              </span>\
              <span class="title text-primary resource-type-cnt" data-cnt="0" id="spnResourceTypeCnt'+ index+'" > ( 0 Selected )</span>\
          </div>\
          <div id="collapseRT'+ index +'" class="collapse" name="'+ name +'" >\
              <div class="card-body pd-y-5">\
                  <div class="d-flex flex-wrap justify-content-start mt-1 getpolicy">\
                    '+ optionsHtml +' \
                  </div>\
              </div>\
          </div>\
      </div>'
    } // if (permissionData[key].length) > 0
  }) // end for each
  
  $('#cheadingOneC').html(strHTML)
}

/*----------------------------------------------------------------------------------
* setResourceTypeDetails
-----------------------------------------------------------------------------------*/
function setResourceTypeDetails() {
  var option = {
    url: "/api/resourcetype/permission/list/",
    method: "post",
    data: {}
  }

  ajaxCall(option, function(response) {
      if (response.error) {
          flashMessage(response.msg, 'danger')
      } else {
        permissionData = response.data
        createRoleResourceTypePermission(permissionData)
      }
  })


  /*----------------------------------------------------------------------------------
  * clsResourcePolicy
  -----------------------------------------------------------------------------------*/
  $("body").on("click", ".clsResourcePolicy", function () {
    let parent_index = $(this).attr("parent-index");

    let data_cnt = $('#spnResourceTypeCnt'+parent_index).attr("data-cnt")

    if ($(this).is(":checked")) {
      data_cnt = parseInt(data_cnt) +  1
    }else
    {
      data_cnt = parseInt(data_cnt) -  1
    }
      
    $('#spnResourceTypeCnt'+parent_index).attr("data-cnt", data_cnt)
    $('#spnResourceTypeCnt'+parent_index).html("( "+ data_cnt +" Selected )")
  })
}

/*----------------------------------------------------------------------------------
* Call function to create UI for role resource permission
-----------------------------------------------------------------------------------*/
getRoleTypeList()
setResourceTypeDetails()


$("#downloadRolePermissionExcel").click(function () {
	submitVirtualForm("/rbc/download/",{'role_id':'all'})
})

