(function($) {

    'use strict';
    var eda = function() {
        this.VERSION = "2.8.0";
        this.$body = $('body');
        //COLORS
        this.color_green="#27cebc";
        this.color_blue="#00acec";
        this.color_yellow="#FDD01C";
        this.color_red="#f35958";
        this.color_grey="#dce0e8";
        this.color_black="#ffffff";
        this.color_purple="#6d5eac";
        this.color_primary="#6d5eac";
        this.color_success="#4eb2f5";
        this.color_danger="#f35958";
        this.color_warning="#f7cf5e";
        this.color_info="#3b4751";
    }
    // Set environment vars
    eda.prototype.initHorizontalMenu = function() {
        $('.horizontal-menu .bar-inner > ul > li').on('click', function () {
            $(this).toggleClass('open').siblings().removeClass('open');

        });
         if($('body').hasClass('horizontal-menu')){
            $('.content').on('click', function () {
                $('.horizontal-menu .bar-inner > ul > li').removeClass('open');
            });
         }
    }
    // Tooltip
    eda.prototype.initTooltipPlugin = function() {
        $.fn.tooltip && $('[data-bs-toggle="tooltip"]').tooltip();
    }
    // Popover
    eda.prototype.initPopoverPlugin = function() {
        $.fn.popover && $('[data-bs-toggle="popover"]').popover();
    }
    // Retina Images
    eda.prototype.initUnveilPlugin = function() {
        $.fn.unveil && $("img").unveil();
    }
    // Auto Scroll Up
    eda.prototype.initScrollUp = function() {
        $('[data-eda="scrollup"]').click(function () {
            $("html, body").animate({
                scrollTop: 0
            }, 700);
            return false;
        });
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('[data-eda="scrollup"]').fadeIn();
            } else {
                $('[data-eda="scrollup"]').fadeOut();
            }
        });
    }
    // Portlet / Panel Tools
    eda.prototype.initPortletTools = function() {
        var $this = this;
        $('body').on('click',".grid .tools .remove", function () {
            var ths  = this

            var attr_report_id  = $(this).closest(".grid-title").siblings(".grid-body").find(".daas_dynamic_div_create").attr("attr-report-id")

            if(attr_report_id==null || attr_report_id=='undefined'){
                var removable = jQuery(this).parents(".grid");
                if (removable.next().hasClass('grid') || removable.prev().hasClass('grid')) {
                    jQuery(this).parents(".grid").remove();
                } else {
                    jQuery(this).parents(".grid").parent().remove();
                }
              } else {
                    var optionData = { url:"/api/reports/removereport/", method: "post"}
                    optionData['data'] = {report_id:attr_report_id}
                     notificationBox(function(data){
                        if(data == 1){
                         ajaxCall(optionData, function (response, error) {
                            if(error){
                              flashMessage(response,'danger');
                            } else {
                                    var removable = jQuery(ths).parents(".grid");
                                    if (removable.next().hasClass('grid') || removable.prev().hasClass('grid')) {
                                        jQuery(ths).parents(".grid").remove();
                                    } else {
                                        jQuery(ths).parents(".grid").parent().remove();
                                    }
                                     flashMessage('Report deleted successfully.');
                            }
                          })
                        }
                 })
              }


        });

        $('body').on('click','.grid .tools a.reload', function () {
            var el = jQuery(this).parents(".grid");
            $this.blockUI(el);
            window.setTimeout(function () {
                $this.unblockUI(el);
            }, 1000);
        });

        $('body').on('click',".grid .tools .collapse, .grid .tools .expand", function () {
                var el = jQuery(this).parents(".grid").children(".grid-body");
            if (jQuery(this).hasClass("collapse")) {
                jQuery(this).removeClass("collapse").addClass("expand");
                var test = $(this).closest('.daas_apply_filter').find('.daas_filter_search');
                $(test).removeClass('in');
                el.slideUp(200);
            } else {
                jQuery(this).removeClass("expand").addClass("collapse");
                el.slideDown(200);
                var test = $(this).closest('.daas_apply_filter').find('.daas_filter_search');
                $(test).addClass('in');
            }
        });
        $("#hide").click(function(){
    $("#quick-access").hide();
});

$("#show").click(function(){
    $("#quick-access").show();
});
        $('.widget-item > .controller .reload').click(function () {
            var el = $(this).parent().parent();
            $this.blockUI(el);
            window.setTimeout(function () {
                $this.unblockUI(el);
            }, 1000);
        });
        $('.widget-item > .controller .remove').click(function () {
            $(this).parent().parent().parent().addClass('animated fadeOut');
            $(this).parent().parent().parent().attr('id', 'id_remove_temp_id');
            setTimeout(function () {
                $('#id_remove_temp_id').remove();
            }, 400);
        });

        $('.tiles .controller .reload').click(function () {
            var el = $(this).parent().parent().parent();
            $this.blockUI(el);
            window.setTimeout(function () {
                $this.unblockUI(el);
            }, 1000);
        });
        $('.tiles .controller .remove').click(function () {
            $(this).parent().parent().parent().parent().addClass('animated fadeOut');
            $(this).parent().parent().parent().parent().attr('id', 'id_remove_temp_id');
            setTimeout(function () {
                $('#id_remove_temp_id').remove();
            }, 400);
        });
        if (!jQuery().sortable) {
            return;
        }
        $(".sortable").sortable({
            connectWith: '.sortable',
            iframeFix: false,
            items: 'div.grid',
            opacity: 0.8,
            helper: 'original',
            revert: true,
            forceHelperSize: true,
            placeholder: 'sortable-box-placeholder round-all',
            forcePlaceholderSize: true,
            tolerance: 'pointer'
        });
    }
    // Scrollbar Plugin
    eda.prototype.initScrollBar = function(){
        $.fn.scrollbar && $('.scroller').each(function () {
            var h = $(this).attr('data-height');
            $(this).scrollbar({
                ignoreMobile:true
            });
            if(h != null  || h !=""){
                if($(this).parent('.scroll-wrapper').length > 0)
                    $(this).parent().css('max-height',h);
                else
                    $(this).css('max-height',h);
            }
        });
    }



    // Sidebar
    eda.prototype.initSideBar = function(){

        var sidebar = $('.page-sidebar');
        var sidebarWrapper = $('.page-sidebar .page-sidebar-wrapper, #daas_dimension_ui, #daas_metrics_ui, .sub-menu, .data-preparation, #chartSummary, #eda_summary_div, #edaPatternDiv, .daas_custom_filter_data_scroll, .daas_custom_limit_data_scroll');
        $('body').on('click','.page-sidebar li > a', function (e) {

            if ($(this).next().hasClass('sub-menu') === false) {
                return;
            }
            var parent = $(this).parent().parent();
            parent.children('li.open').children('a').children('.arrow').removeClass('open');
            parent.children('li.open').children('a').children('.arrow').removeClass('active');
            parent.children('li.open').children('.sub-menu').slideUp(200);
            parent.children('li').removeClass('open');

            var sub = jQuery(this).next();
            if (sub.is(":visible")) {
                jQuery('.arrow', jQuery(this)).removeClass("open");
                jQuery(this).parent().removeClass("active");
                sub.slideUp(200, function () {
                });
            } else {
                jQuery('.arrow', jQuery(this)).addClass("open");
                jQuery(this).parent().addClass("open");
                sub.slideDown(200, function () {
                });
            }
            e.preventDefault();
        });
        //Auto close open menus in Condensed menu
        if (sidebar.hasClass('mini')) {
            var elem = jQuery('.page-sidebar ul');
            elem.children('li.open').children('a').children('.arrow').removeClass('open');
            elem.children('li.open').children('a').children('.arrow').removeClass('active');
            elem.children('li.open').children('.sub-menu').slideUp(200);
            elem.children('li').removeClass('open');
        }
        $.fn.scrollbar && sidebarWrapper.scrollbar();
    }
    // Sidebar Toggler
    eda.prototype.initSideBarToggle = function(){
        var $this = this;
       // $('body').on('click',".grid .tools .remove", function () {
        $('body').on('click touchstart', '[data-eda="toggle-left-side"]', function (e) {
            e.preventDefault();
            $this.toggleLeftSideBar();
        });
        $('body').on('click touchstart', '[data-eda="toggle-right-side"]', function (e) {
            e.preventDefault();
            $this.toggleRightSideBar();
        });
    }
    // Left Side Bar / Chat view
    eda.prototype.toggleLeftSideBar = function(){
        var timer;
        if($('body').hasClass('open-menu-left')){
            $('body').removeClass('open-menu-left');
            timer= setTimeout(function(){
                $('.page-sidebar').removeClass('visible');
            }, 300);

        }
        else{
            clearTimeout(timer);
            $('.page-sidebar').addClass('visible');
            setTimeout(function(){
                 $('body').addClass('open-menu-left');
            }, 50);
        }
    }
    // Right Side Bar / Mobile
    eda.prototype.toggleRightSideBar = function(){
        var timer;
        if($('body').hasClass('open-menu-right')){
            $('body').removeClass('open-menu-right');
            timer= setTimeout(function(){
                $('.chat-window-wrapper').removeClass('visible');
            }, 300);
        }
        else{
            clearTimeout(timer);
            $('.chat-window-wrapper').addClass('visible');
            $('body').addClass('open-menu-right');
        }
    }

    //  // Right Side for paramters Bar / Mobile
    //  eda.prototype.toggleRightSideBar = function(){
    //     var timer;
    //     if($('body').hasClass('open-menu-right-parameters')){
    //         $('body').removeClass('open-menu-right-parameters');
    //         timer= setTimeout(function(){
    //             $('.chat-window-wrapper-param').removeClass('visible');
    //         }, 300);
    //     }
    //     else{
    //         clearTimeout(timer);
    //         $('.chat-window-wrapper-param').addClass('visible');
    //         $('body').addClass('open-menu-right-parameters');
    //     }
    // }

    // Progress bar animation
    eda.prototype.initProgress = function(){
        $('[data-init="animate-number"], .animate-number').each(function () {
            var data = $(this).data();
            $(this).animateNumbers(data.value, true, parseInt(data.animationDuration, 10));
        });
        $('[data-init="animate-progress-bar"], .animate-progress-bar').each(function () {
            var data = $(this).data();
            $(this).css('width', data.percentage);
        });
    }
    
    // common Select2 initialize
    $(document).ready(function(){
        $(".select2-common").select2({
            placeholder:"Select"
        });

        // Function to close all Select2 dropdowns when modal will open in anywhere
        function closeAllSelect2Dropdowns() {
            $('select').each(function() {
              if ($(this).data('select2')) {
                $(this).select2('close');
              }
            });
          }       
        document.addEventListener('show.bs.modal', function (event) {
            closeAllSelect2Dropdowns();
        });        
        // Optional: Also close dropdowns when clicking on the modal backdrop
        document.addEventListener('click', function (event) {
            if (event.target.classList.contains('modal')) {
            closeAllSelect2Dropdowns();
            }
        });

        // Common resizable right sidebar
        $("body").on("click","#resize-r-sidebar-open",function(){
            $("#resize-r-sidebar-container").removeClass("d-none");
        })
        
        $("body").on("click", "#resize-r-sidebar-close", function(){
            $("#resize-r-sidebar-container").addClass("d-none");
        })
        // mapper sidebar resize
        $(function() {
            $( "#resize-r-sidebar-container" ).resizable({
                handles: 'w',
                minWidth: 300, // Set minimum width
                maxWidth: $(window).width() * 0.90 // Set maximum width to 90% of window width
            });
        });  
    })

    // Select2 Plugin
    eda.prototype.initSelect2Plugin = function() {
        $.fn.select2 && $('[data-init-plugin="select2"]').each(function() {
            $(this).select2({
                minimumResultsForSearch: ($(this).attr('data-disable-search') == 'true' ? -1 : 1)
            }).on('select2-opening', function() {
                $.fn.scrollbar && $('.select2-results').scrollbar({
                    ignoreMobile: false
                })
            });
        });
    }

    //Select2 search input focus
    $(document).on('select2:open', () => {
        document.querySelector('.select2-container--open .select2-search__field').focus();
    });
    // fix select2 bootstrap modal scroll bug
      $(document).on('select2:close', function(e) {
        var evt = "scroll.select2"
        $(e.target).parents().off(evt)
        $(window).off(evt)
      })


    // Form Elements
    eda.prototype.initFormElements = function(){
        $(".inside").children('input').blur(function () {
            $(this).parent().children('.add-on').removeClass('input-focus');
        });

        $(".inside").children('input').focus(function () {
            $(this).parent().children('.add-on').addClass('input-focus');
        });

        $(".input-group.transparent").children('input').blur(function () {
            $(this).parent().children('.input-group-addon').removeClass('input-focus');
        });

        $(".input-group.transparent").children('input').focus(function () {
            $(this).parent().children('.input-group-addon').addClass('input-focus');
        });

        $(".bootstrap-tagsinput input").blur(function () {
            $(this).parent().removeClass('input-focus');
        });

        $(".bootstrap-tagsinput input").focus(function () {
            $(this).parent().addClass('input-focus');
        });
    }
    // Validation Plugin
    eda.prototype.initValidatorPlugin = function() {
        $.validator && $.validator.setDefaults({
            errorPlacement: function(error, element) {
                var parent = $(element).closest('.form-group');
                if (parent.hasClass('form-group-default')) {
                    parent.addClass('has-error');
                    error.insertAfter(parent);
                } else {
                    error.insertAfter(element);
                }
            },
            onfocusout: function(element) {
                var parent = $(element).closest('.form-group');
                if ($(element).valid()) {
                    parent.removeClass('has-error');
                    parent.next('.error').remove();
                }
            },
            onkeyup: function(element) {
                var parent = $(element).closest('.form-group');
                if ($(element).valid()) {
                    $(element).removeClass('error');
                    parent.removeClass('has-error');
                    parent.next('label.error').remove();
                    parent.find('label.error').remove();
                } else {
                    parent.addClass('has-error');
                }
            },
            success: function (label, element) {
                // var parent = $(element).parent('.input-with-icon');
                // parent.removeClass('error-control').addClass('success-control');
            },
        });


    }
    // Block UI
    eda.prototype.blockUI = function(el){
        $(el).block({
            message: '<div class="loading-animator"></div>',
            css: {
                border: 'none',
                padding: '2px',
                backgroundColor: 'none'
            },
            overlayCSS: {
                backgroundColor: '#fff',
                opacity: 0.3,
                cursor: 'wait'
            }
        });
    }
    eda.prototype.unblockUI = function(el){
        $(el).unblock();
    }
    // Call initializers
    eda.prototype.init = function() {
        // init layout
        this.initSideBar();
        this.initSideBarToggle();
        this.initHorizontalMenu();
        this.initPortletTools();
        this.initScrollUp();
        this.initProgress();
        this.initFormElements();
        // init plugins
        this.initSelect2Plugin();
        this.initUnveilPlugin();
        this.initScrollBar();
        this.initTooltipPlugin();
        this.initPopoverPlugin();
        this.initValidatorPlugin();
    }

    $.eda = new eda();
    $.eda.Constructor = eda;

})(window.jQuery);

// DEMO STUFF
$(document).ready(function () {

    $("#menu-collapse").click(function () {
        if ($('.page-sidebar').hasClass('mini')) {
            $('.page-sidebar').removeClass('mini');
            $('.page-content').removeClass('condensed-layout');
            $('.footer-widget').show();
        } else {
            $('.page-sidebar').addClass('mini');
            $('.page-content').addClass('condensed-layout');
            $('.footer-widget').hide();
        }
    });



    //***********************************END Grids*****************************



    //***********************************BEGIN Main Menu Toggle *****************************
    $('#layout-condensed-toggle').click(function () {
        if ($('#main-menu').attr('data-inner-menu') == '1') {
            //Do nothing
        } else {
            if ($('#main-menu').hasClass('mini')) {
                $('body').removeClass('grey');
                $('body').removeClass('condense-menu');
                $('#main-menu').removeClass('mini');
                $('.page-content').removeClass('condensed');
                $('.scrollup').removeClass('to-edge');
                $('.header-seperation').show();
                //Bug fix - In high resolution screen it leaves a white margin
                $('.header-seperation').css('height', '61px');
                $('.footer-widget').show();
            } else {
                $('body').addClass('grey');
                $('#main-menu').addClass('mini');
                $('.page-content').addClass('condensed');
                $('.scrollup').addClass('to-edge');
                $('.header-seperation').hide();
                $('.footer-widget').hide();
                $('.main-menu-wrapper').scrollbar('destroy');
            }
        }
    });

    if ($.fn.sparkline) {
        $('.sparklines').sparkline('html', {
            enableTagOptions: true
        });
    }

});



//******************************* Bind Functions Jquery- LAYOUT OPTIONS API ***************

(function ($) {
    //Show/Hide Main Menu
    $.fn.toggleMenu = function () {
        var windowWidth = window.innerWidth;
        if(windowWidth >768){
            $(this).toggleClass('hide-sidebar');
        }
    };
    //Condense Main Menu
    $.fn.condensMenu = function () {
        var windowWidth = window.innerWidth;
        if(windowWidth >768){
            if ($(this).hasClass('hide-sidebar')) $(this).toggleClass('hide-sidebar');

            $(this).toggleClass('condense-menu');
            $(this).find('#main-menu').toggleClass('mini');
        }
    };
    //Toggle Fixed Menu Options
    $.fn.toggleFixedMenu = function () {
        var windowWidth = window.innerWidth;
        if(windowWidth >768){
        $(this).toggleClass('menu-non-fixed');
        }
    };

    $.fn.toggleHeader = function () {
        $(this).toggleClass('hide-top-content-header');
    };

    $.fn.toggleChat = function () {
        $.eda.toggleRightSideBar();
    };
    $.fn.layoutReset = function () {
        $(this).removeClass('hide-sidebar');
        $(this).removeClass('condense-menu');
        $(this).removeClass('hide-top-content-header');
        if(!$('body').hasClass('extended-layout'))
        $(this).find('#main-menu').removeClass('mini');
    };

})(jQuery);


$(function() {
    'use strict';
    // Initialize layouts and plugins
    $.eda.init();
});

//Text limitation
$(document).ready(function(){
    //500 charector limitation
    $('.tx-limit-500').keyup(function () {
      let max = 500;
      let len = $(this).val().length;
      if (len >= max) {
        $(this).next('.tx-limit-info').text(' You have reached the limit').addClass('tx-danger');
      } else {
        let char = max - len;
        $(this).next('.tx-limit-info').text(char + ' characters left').removeClass('tx-danger');
      }
    });

    //250 charector limitation
    $('.tx-limit-250').keyup(function () {
        let max = 250;
        let len = $(this).val().length;
        if (len >= max) {
          $(this).next('.tx-limit-info').text(' You have reached the limit').addClass('tx-danger');
        } else {
          let char = max - len;
          $(this).next('.tx-limit-info').text(char + ' characters left').removeClass('tx-danger');
        }
      });

    //200 charector limitation
    $('.tx-limit-200').keyup(function () {
        let max = 200;
        let len = $(this).val().length;
        if (len >= max) {
          $(this).next('.tx-limit-info').text(' You have reached the limit').addClass('tx-danger');
        } else {
          let char = max - len;
          $(this).next('.tx-limit-info').text(char + ' characters left').removeClass('tx-danger');
        }
      }); 
      
       //150 charector limitation
    $('.tx-limit-150').keyup(function () {
        let max = 150;
        let len = $(this).val().length;
        if (len >= max) {
          $(this).next('.tx-limit-info').text(' You have reached the limit').addClass('tx-danger');
        } else {
          let char = max - len;
          $(this).next('.tx-limit-info').text(char + ' characters left').removeClass('tx-danger');
        }
      }); 

    //50 charector limitation
    $('.tx-limit-50').keyup(function () {
        let max = 50;
        let len = $(this).val().length;
        if (len >= max) {
          $(this).next('.tx-limit-info').text(' You have reached the limit').addClass('tx-danger');
        } else {
          let char = max - len;
          $(this).next('.tx-limit-info').text(char + ' characters left').removeClass('tx-danger');
        }
      });  

  });

// Top navigation Tooltip will hide if screen size start from 1400px resolution
  $(document).ready(function(){
    if(window.matchMedia('(min-width: 1400px)').matches) {
        $('.responsive-nav li a').tooltip('disable');
      }
  })

/*#############################################################################################
# Desc : shortText function used to add '...' after given lenght in string.
# Param : str:- current value,Type-String,length:- length of string after add three dot,Type-Int
# Return Value : toset:- after operation string.
#############################################################################################*/
function shortText(str, length) {
    var toset = str;
    if (str.length > length) {
        toset = str.substring(0, length) + '...';
        checkTickValueLenght_Flag = true
    }
    return toset
}