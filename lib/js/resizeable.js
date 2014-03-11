(function($){
    MResizeable = Class.extend({
        init: function(immediateResize, cb) {
            var _this = this;
            if(immediateResize){
                Meteor.startup(function(){
                    _this.resizeAllElements();
                    MobiRouter.animateScroller(false, 10);
                });
            }

            var _this = this;
            $(window).resize(function() {
                _this.resizeAllElements(cb, true);
            });
        },
        resizeAllElements: function(cb, refreshScroller) {
            var width = window.innerWidth,
                height = window.innerHeight;

            for (var resizeFunc in this.elements) {
                this.elements[resizeFunc].call(this, width, height);
            }

            Meteor.setTimeout(function(){
                if(_.isFunction(cb) )
                    cb.call();
                if( refreshScroller == true )
                    MobiRouter.animateScroller(false, 10);
            }, 100);
        },
        elements: {
            resizeMobiRouter: function(width, height) {
                this.sizes = MobiRouter.calculateSizes(width, height);

                if( !document.getElementById('mobi_router') )
                    return;

                if(isMobile || MobiRouter.showFullScreen) {
                    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
                } else {
                    document.getElementsByTagName('body')[0].style.overflow = 'auto';
                }

                document.getElementById('mobi_router').style.width = MobiRouter.sizes.router.width+"px";
                document.getElementById('mobi_router').style.height = MobiRouter.sizes.router.height+"px";
                document.getElementById('mobi_router').style.top = 0+"px";
                document.getElementById('mobi_router').style.left = 0+"px";
                document.getElementById('mobi_router').style.margin = 0+"px";
                //alert('resizeMobiRouter');
            },
            resizeHeader: function() {
                if( !document.getElementById('mobi_header') )
                    return;
                document.getElementById('mobi_header').style.height = MobiRouter.settings.headerHeight+"px";
                //alert('resizeHeader');
            },
            resizeMobileContainer: function(width, height) {
                if( !document.getElementById('mobi_router') )
                    return;
                if(!isMobile && !MobiRouter.showFullScreen) document.getElementById('mobi_router').className += document.getElementById('mobi_router').className.indexOf('mobi_router_on_desktop') == -1 ? ' mobi_router_on_desktop' : '';
                else document.getElementById('mobi_router').className = document.getElementById('mobi_router').className.replace('mobi_router_on_desktop', '');
                //alert('resizeMobileContainer');
            },
            resizeSidebar: function(width, height) {
                if( !document.getElementById('mobi_sidebar') )
                    return;
                document.getElementById('mobi_sidebar').style.height = MobiRouter.sizes.sidebar.height+"px";
                document.getElementById('mobi_sidebar').style.width = MobiRouter.sizes.sidebar.width+"px";
                //alert('resizeSidebar');
            },
            resizeMobiMain: function(width, height) {
                if( !document.getElementById('mobi_main') )
                    return;
                if( MobiRouter.sidebarShown ){
                    $('#mobi_main').hardwareAnimate({translateX: MobiRouter.sizes.sidebar.width-MobiRouter.mainTranslateX}, 0);
                    MobiRouter.mainTranslateX = MobiRouter.sizes.sidebar.width;
                }
                document.getElementById('mobi_main').style.width = MobiRouter.sizes.main.width+"px";
                //alert('resizeMobiMain');
            },
            resizeMobiContent: function(width, height) {
                if( !document.getElementById('mobi_content') || !document.getElementById('sequence_slider_wrapper')|| !document.getElementById('sequence_scroller') )
                    return;
                if( document.getElementById('sequence_scroller') ){
                    document.getElementById('sequence_slider_wrapper').style.height = MobiRouter.sizes.content.height+"px";
                    //console.log(MobiRouter.getSlideStackSize() * document.getElementById('sequence_slider_wrapper').offsetWidth);
                    document.getElementById('sequence_scroller').style.width = (MobiRouter.getSlideStackSize() * document.getElementById('sequence_slider_wrapper').offsetWidth)+"px";
                }
                document.getElementById('mobi_content').style.height = MobiRouter.sizes.content.height+"px";
                //document.getElementById('mobi_content').style.width = MobiRouter.sizes.main.width+"px";
                //console.log(document.getElementsByClassName('mobi_page'));
                _.each(document.getElementsByClassName('mobi_page'), function(page){
                    page.style.width = (MobiRouter.sizes.content.width) +"px";
                    page.style.height = (MobiRouter.sizes.content.height) +"px";
                });
                //alert('resizeMobiContent');
            },
            resizeSliderWrapper: function(){

            },
            resizeTitle: function(){
                if( !document.getElementById('header_back_btn') || !document.getElementById('header_done_btn') || !document.getElementById('header_page_title') || !document.getElementById('mobi_header') )
                    return;
                var backBtn = window.getComputedStyle(document.getElementById('header_back_btn')),
                    backBtnFullWidth = backBtn ? parseInt(backBtn.width, 10)+parseInt(backBtn.marginLeft, 10)+parseInt(backBtn.marginRight, 10) : 0,
                    doneBtn = window.getComputedStyle(document.getElementById('header_done_btn')),
                    doneBtnFullWidth = doneBtn ? parseInt(doneBtn.width, 10)+parseInt(doneBtn.marginLeft, 10)+parseInt(doneBtn.marginRight, 10) : 0,
                    sbToggle = document.getElementById('mobi_sidebar_toggle').offsetWidth,
                    pageTitle = window.getComputedStyle(document.getElementById('mobi_page_title')),
                    pageTitlePadding = parseInt(pageTitle.paddingLeft, 10)+parseInt(pageTitle.paddingRight, 10),
                    headerWidth = parseInt(window.getComputedStyle(document.getElementById('mobi_header')).width, 10);
                var fullLoss = backBtnFullWidth + doneBtnFullWidth + sbToggle + pageTitlePadding;
                //console.log(fullLoss);
                document.getElementById('mobi_page_title').style.width = (headerWidth - fullLoss)+"px";
            },
            resizeScrolls: function(){
                Meteor.setTimeout(function(){
                    MobiRouter.initScrolls();
                }, 100);
            },
            /*resizeMobilePages: function(width, height, header, footer) {
                $('.mobile_pages').css('width', $('#mobile_container').width());
                $('.mobile_pages').css('height', $('#mobile_container').height() - footer - header); //subtract height of footer and toolbar
            },
            resizeSlidingPageWrapper: function(width, height, header, footer) {
                $('#sliding_page_wrapper').css('width', $('.mobile_pages').length * $('#mobile_container').width());
                $('#sliding_page_wrapper').css('height', $('#mobile_container').height() - footer - header); //subtract height of footer and toolbar
            },*/
        }
    });

    MobiResizeable = new MResizeable;

})(jQuery);
