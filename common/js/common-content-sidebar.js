$(function(){

  'use strict'

  $('[data-bs-toggle="tooltip"]').tooltip();

  // set active contact from list to show in desktop view by default
  if(window.matchMedia('(min-width: 992px)').matches) {
    $('.common-list .media:first-of-type').addClass('active');
  }

  
  new PerfectScrollbar('.common-content-body', {
    suppressScrollX: true
  });

  new PerfectScrollbar('.common-content-sidebar', {
    suppressScrollX: true
  });


  $('.common-navleft .nav-link').on('shown.bs.tab', function(e) {
    contactSidebar.update()
  })

  // UI INTERACTION
  $('.common-list .media').on('click', function(e) {
    e.preventDefault();

    $('.common-list .media').removeClass('active');
    $(this).addClass('active');

    var cName = $(this).find('h6').text();
    $('#contactName').text(cName);

    var cAvatar = $(this).find('.avatar').clone();

    cAvatar.removeClass (function (index, className) {
      return (className.match (/(^|\s)avatar-\S+/g) || []).join(' ');
    });
    cAvatar.addClass('avatar-xl');

    $('#contactAvatar .avatar').replaceWith(cAvatar);


    // showing contact information when clicking one of the list
    // for mobile interaction only
    if(window.matchMedia('(max-width: 991px)').matches) {
      $('body').addClass('common-content-show');
      
      $('body').removeClass('common-content-visible');
      
      $('#mainMenuOpen').addClass('d-none');
      $('#contactContentHide').removeClass('d-none');
    }
  })
  
  
  // going back to contact list
  // for mobile interaction only
  $('#contactContentHide').on('click touch', function(e){
    e.preventDefault();
    
    $('body').removeClass('common-content-show common-options-show');
    $('body').addClass('common-content-visible');
    
    $('#mainMenuOpen').removeClass('d-none');
    $(this).addClass('d-none');
  });
  
  $('#contactOptions').on('click', function(e){
    e.preventDefault();
    $('body').addClass('app-common');
    $('body').toggleClass('common-options-show');
  })

  $(window).resize(function(){
    $('body').removeClass('common-options-show');
  })

})
