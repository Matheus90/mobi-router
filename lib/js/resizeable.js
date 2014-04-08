(function($){
    MResizeable = Class.extend({
        init: function(immediateResize, cb) {
            var _this = this;
            if(immediateResize){
                Meteor.startup(function(){
                    _this.resizeAllElements();
                    MobiRouter.jumpToPosition();
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
                    MobiRouter.jumpToPosition();
            }, 100);
        },
        elements: {
            resizeMobiRouter: function(width, height) {
                this.sizes = MobiRouter.calculateSizes();
                MobiRouter.backgroundDep.changed();

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
            },
            resizeHeader: function() {
                if( !document.getElementById('mobi_header') )
                    return;
                document.getElementById('mobi_header').style.height = MobiRouter.sizes.header.height+"px";
                document.getElementById('mobi_header').style.lineHeight = MobiRouter.sizes.header.height+"px";
            },
            resizeFooter: function() {
                if( !document.getElementById('mobi_footer') )
                    return;
                document.getElementById('mobi_footer').style.height = MobiRouter.sizes.footer.height+"px";
                document.getElementById('mobi_footer').style.lineHeight = MobiRouter.sizes.footer.height+"px";
                var elements = document.querySelectorAll( "#mobi_footer_scroller > * "),
                    width = 0;
                _.each(elements, function(el){
                    width += el.offsetWidth;
                });
                document.querySelector( "#mobi_footer_scroller").style.width = width+'px';
                document.querySelector( "#mobi_footer_scroller").style.minWidth = MobiRouter.sizes.main.width+"px";
            },
            resizeMobileContainer: function(width, height) {
                if( !document.getElementById('mobi_router') )
                    return;
                if(!isMobile && !MobiRouter.showFullScreen) document.getElementById('mobi_router').className += document.getElementById('mobi_router').className.indexOf('mobi_router_on_desktop') == -1 ? ' mobi_router_on_desktop' : '';
                else document.getElementById('mobi_router').className = document.getElementById('mobi_router').className.replace('mobi_router_on_desktop', '');
            },
            resizeSidebar: function(width, height) {
                if( !document.getElementById('mobi_sidebar') )
                    return;
                document.getElementById('mobi_sidebar').style.height = MobiRouter.sizes.sidebar.height+"px";
                document.getElementById('mobi_sidebar').style.width = MobiRouter.sizes.sidebar.width+"px";
            },
            resizeMobiMain: function(width, height) {
                if( !document.getElementById('mobi_main') )
                    return;
                if( MobiRouter.sidebarShown ){
                    MobiRouter.sidebarShown = false;
                    MobiRouter.showSidebar();
                }
                document.getElementById('mobi_main').style.width = MobiRouter.sizes.main.width+"px";
            },
            resizeMobiContent: function(width, height) {
                if( !document.getElementById('mobi_content') || !document.getElementById('sequence_slider_wrapper')|| !document.getElementById('sequence_scroller') )
                    return;
                if( document.getElementById('sequence_scroller') ){
                    document.getElementById('sequence_slider_wrapper').style.height = MobiRouter.sizes.content.height+"px";
                    document.getElementById('sequence_scroller').style.width = (MobiRouter.getSlideStackSize() * document.getElementById('sequence_slider_wrapper').offsetWidth)+"px";
                }
                document.getElementById('mobi_content').style.height = MobiRouter.sizes.content.height+"px";

                _.each(document.getElementsByClassName('mobi_page'), function(page){
                    page.style.width = (MobiRouter.sizes.content.width) +"px";
                    page.style.height = (MobiRouter.sizes.content.height) +"px";
                });
            },
            resizeSliderWrapper: function(){

            },
            resizeTitle: function(){
                if( !document.getElementById('mobi_page_title') || !document.getElementById('mobi_header') )
                    return;

                /*var backBtn = window.getComputedStyle(document.getElementById('header_back_btn')),
                    backBtnFullWidth = backBtn ? parseFloat(backBtn.width, 10)+parseFloat(backBtn.marginLeft, 10)+parseFloat(backBtn.marginRight, 10) : 0,
                    doneBtn = window.getComputedStyle(document.getElementById('header_done_btn')),
                    doneBtnFullWidth = doneBtn ? parseFloat(doneBtn.width, 10)+parseFloat(doneBtn.marginLeft, 10)+parseFloat(doneBtn.marginRight, 10) : 0;*/

                var sbToggle = document.getElementById('mobi_sidebar_toggle').offsetWidth,
                    pageTitle = window.getComputedStyle(document.getElementById('mobi_page_title')),
                    pageTitlePadding =  parseFloat(pageTitle.paddingLeft, 10) +
                                        parseFloat(pageTitle.paddingRight, 10) +
                                        parseFloat(pageTitle.marginLeft, 10) +
                                        parseFloat(pageTitle.marginRight, 10) +
                                        parseFloat(pageTitle.borderLeft, 10) +
                                        parseFloat(pageTitle.borderRight, 10),
                    headerWidth = parseFloat(window.getComputedStyle(document.getElementById('mobi_header')).width, 10);

                var buttonsWidth = 0;
                _.each(document.getElementsByClassName('header_btn'), function(button){
                    var computed = window.getComputedStyle(button),
                        btnWidth = computed ?
                            parseFloat(computed.width, 10) +
                            parseFloat(computed.marginLeft, 10) +
                            parseFloat(computed.marginRight, 10) +
                            parseFloat(computed.paddingLeft, 10) +
                            parseFloat(computed.paddingRight, 10) +
                            parseFloat(computed.borderLeft, 10) +
                            parseFloat(computed.borderRight, 10) + 10
                            : 0;

                    buttonsWidth += btnWidth;
                });

                var fullLoss = buttonsWidth + sbToggle + pageTitlePadding;
                document.getElementById('mobi_page_title').style.width = (headerWidth - fullLoss)+"px";
            },
            resizeScrolls: function(){
                Meteor.setTimeout(function(){
                    MobiRouter.initScrolls();
                }, 100);
            },
            resizeAFTER: function(){
                if(_.isFunction(MobiRouter.settings.afterResizeFunction) )
                    MobiRouter.settings.afterResizeFunction();
            }
        },
        centralizeAbs: function(parent, elem, corrX, corrY){
            corrX = corrX || 0;
            corrY = corrY || 0;
            var parentNode = parent,
                childNode = elem;

            if( !childNode || !parentNode ) return false;

            var width = parentNode.offsetWidth,
                childWidth = childNode.offsetWidth,
                left = Math.max( parseFloat((width - childWidth - corrX)/2), 0);

            var height = parentNode.offsetHeight,
                childHeight = childNode.offsetHeight,
                top = Math.max( parseFloat((height - childHeight - corrY)/2), 0);

            childNode.style.top = top+'px';
            childNode.style.left = left+'px';
        }
    })

    MobiResizeable = new MResizeable;

})(jQuery);
