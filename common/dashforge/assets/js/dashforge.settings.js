
$(function(){
  'use strict'

  // Append settings
  // $.ajax({
  //   // url: 'settings-.html',
  //   success: function(result){
  //     $('body').append(result);
  //     feather.replace();

      var hasMode = Cookies.get('df-mode');
      if(hasMode) {
        $('head').append('<link id="dfMode" rel="stylesheet" href="/common/web/css/theme/skin.'+hasMode+'.css">')
        $('body').find('.df-mode').each(function(){
          var name = $(this).attr('data-title');
          if(name === hasMode) {
            $(this).addClass('active');
          } else {
            $(this).removeClass('active');
          }
        })
      }

      var hasSkin = Cookies.get('df-skin');
      if(hasSkin) {
        $('head').append('<link id="dfSkin" rel="stylesheet" href="/common/web/css/theme/skin.'+hasSkin+'.css">')
        $('body').find('.df-skin').each(function(){
          var name = $(this).attr('data-title');
          if(name === hasSkin) {
            $(this).addClass('active');
          } else {
            $(this).removeClass('active');
          }
        })
      }
  //   }
  // });

  // Template Customizer
  $('body').on('click', '#dfSettingsShow', function(e){
    e.preventDefault()

    $('.df-settings').toggleClass('show');
  })

  $('body').on('click', '.df-mode', function(e){
    e.preventDefault();

    if(!$(this).hasClass('disabled')) {
      $(this).parent().siblings().find('.df-mode').removeClass('active');
      $(this).addClass('active');

      var mode = $(this).attr('data-title');

      if(mode === 'dark') {
        darkMode();
      } else {
        lightMode();
      }

      if(mode === 'classic') {
        $('#dfMode').remove();

        Cookies.remove('df-mode');
      } else {

        if($('#dfMode').length === 0) {
          if($('#dfSkin').length === 0) {
            $('head').append('<link id="dfMode" rel="stylesheet" href="/common/web/css/theme/skin.'+mode+'.css">');
          } else {
            $('<link id="dfMode" rel="stylesheet" href="/common/web/css/theme/skin.'+mode+'.css">').insertBefore($('#dfSkin'));
          }
        } else {
          $('#dfMode').attr('href', '/common/web/css/theme/skin.'+mode+'.css');
        }

        Cookies.set('df-mode', mode);
      }
    }
  })

  $('body').on('click', '.df-skin', function(e){
    e.preventDefault();

    $(this).parent().siblings().find('.df-skin').removeClass('active');
    $(this).addClass('active');

    var skin = $(this).attr('data-title');

    if(skin === 'default') {
      $('#dfSkin').remove();

      Cookies.remove('df-skin');
    } else {

      if($('#dfSkin').length === 0) {
        $('head').append('<link id="dfSkin" rel="stylesheet" href="/common/web/css/theme/skin.'+skin+'.css">')
      } else {
        $('#dfSkin').attr('href', '/common/web/css/theme/skin.'+skin+'.css');
      }

      Cookies.set('df-skin', skin);
    }

  })

  $('body').on('click', '#setFontRoboto', function(e){
    e.preventDefault()
    $(this).addClass('active-primary');
    $('body').removeClass('df-rubik');
    $('body').removeClass('df-ibmPlex');
    $('#setFontBase').removeClass('active-primary');
    $('#setFontRubik').removeClass('active-primary');
  })

  $('body').on('click', '#setFontRubik', function(e){
    e.preventDefault()
    $('body').addClass('df-rubik')
    $('body').removeClass('df-roboto');
    $('body').removeClass('df-ibmPlex');
    $(this).addClass('active-primary');
    $('#setFontBase').removeClass('active-primary');
    $('#setFontRoboto').removeClass('active-primary');


  })

  $('body').on('click', '#setFontBase', function(e){
    e.preventDefault()
    $('body').addClass('df-ibmPlex')
    $('body').removeClass('df-roboto');
    $('body').removeClass('df-rubik');
    $(this).addClass('active-primary');
    $('#setFontRoboto').removeClass('active-primary');
    $('#setFontRubik').removeClass('active-primary');
  })
})

/*#############################################################################################
# Dark Theme button and graph changes
#############################################################################################*/
$(function(){
  'use strict'
window.darkMode = function(){
  
  $('.btn-white').addClass('btn-dark').removeClass('btn-white');
}

window.lightMode = function() {
  
  $('.btn-dark').addClass('btn-white').removeClass('btn-dark');
}

var hasMode = Cookies.get('df-mode');
if(hasMode === 'dark') {
  darkMode();
  $( "#etl-darkmode" ).prop('checked', true);
} else {
  lightMode();
  $( "#etl-darkmode" ).prop('checked', false);
}
})

/*#############################################################################################
# Modal Close on esc Button
#############################################################################################*/

var modals=[]; // array to store modal id
$(document).ready(function(){
$('.modal').modal({show: false, keyboard: false}); // disable keyboard because it conflicts below
$('.modal').on('show.bs.modal', function (event) {
   //add modal id to array
   modals.push(event.target.id);
});
document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        if(modals.length>0){
            //get last modal id by using pop(). 
            //This function also removes last item in array.
            var id = modals.pop();
            if($('#'+id).is(':visible')){ // if modal is not closed by click or close button
                $('#'+id).modal('toggle');
            }
        }else{
            // alert("Could not find any modals!");
            return true
        }
    }
};
});

$(function(){
  $('.asset-content-sidebar_wrapper').scroll(function(){ // when scroll on content box
    var winScroll = $(".content-height").height() - $(".asset-content-sidebar_wrapper").height(); // Content height - content box
    var width = $(".asset-content-sidebar_wrapper").scrollTop(); // content box scroll up
    var scrolled = ((width / winScroll) * 100);
    var $bgColor = scrolled > 99 ? "#198754" : "#ffc107";
    $(".progressed .bar")
    .width(scrolled + "%")
    .css({ backgroundColor: $bgColor }); // when scroll up/down progress div and bar showing percentage 
  });
});