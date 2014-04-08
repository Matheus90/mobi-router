(function(){

    /** mobi_router HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_router.mobi_sidebar = function(){ MobiRouter.dep.depend(); return Template.mobi_sidebar; };
    Template.mobi_router.mobi_header = function(){ MobiRouter.dep.depend(); MobiRouter.headerDep.depend(); return Template.mobi_header; };
    Template.mobi_router.mobi_content = function(){ MobiRouter.dep.depend(); return Template.mobi_content; };
    Template.mobi_router.isFooter = function(){ MobiRouter.dep.depend(); MobiResizeable.resizeAllElements(); return Boolean(MobiRouter.settings.footer); };
    Template.mobi_router.mobileClass = function(){ MobiRouter.dep.depend(); MobiRouter.backgroundDep.depend(); return isMobile || MobiRouter.showFullScreen ? 'mobile-display' : '' };

    Template.mobi_router.rendered = function(){ MobiResizeable.init(true); };


    /** mobi_loading HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_loading.loading_template = function(){
        return MobiRouter.loadingTemplate();
    };


    /** mobi_sidebar HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_sidebar.sidebarContent = function(){
        Deps.afterFlush(function(){
            MobiRouter.refreshSidebarScroll();
        });
        return Template[MobiRouter.settings.sidebarTemplate];
    };


    /** mobi_sidebar HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_footer.footerContent = function(){
        Deps.afterFlush(function(){
            MobiRouter.refreshFooterScroll();
        });
        return Template[MobiRouter.settings.footerTemplate];
    };

    Template.mobi_footer.rendered = function(){
    };



    /** mobi_content HELPERS, EVENTS & CALLBACKS **/

    var firstLoad = 0;

    Template.mobi_content.slides = function() {
        MobiRouter.speak('Template.sliding_page_wrapper.slides');
        var slides = MobiRouter.getSlideStack();

        if( slides.length && firstLoad === 0 && MobiRouter.storedRoutes().length){
            firstLoad = 1;
            Deps.afterFlush(function(){
                MobiResizeable.resizeAllElements( function(){
                    MobiRouter.jumpToPosition();
                });
            });
            Meteor.setTimeout(function(){
                MobiRouter.loading(false);
            }, MobiRouter.settings.minLoadingTemplateTime);
        }else{
            Deps.afterFlush(function(){
                MobiResizeable.resizeAllElements( function(){
                    MobiRouter.animateScroller(false, false, true);
                });
            });
        }

        return slides;
    };

    Template.mobi_content.rendered = function(){
        MobiRouter.speak('"mobi_content" template rendered');
    };



    /** mobi_page_content HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_page_content.pageContent = function(){
        var _this = this._r;
        MobiRouter.speak('page content asked for:' + _this.name);
        Deps.afterFlush(function(){
            MobiResizeable.elements.resizeTitle();
            refreshIscrolls(['pos'+_this.position+'_page_iscroll_'+_this.name]);
        });
        return !MobiRouter.loading() ? MobiRouter.content(_this) : null;
    };

    Template.mobi_page_content.pageData = function(){
        var data =  !_.isBoolean(this) ? this.getData(this.getPath()) : {};
        data._r = this;
        return data;
    };

    Template.mobi_page_content.helpers({
        name: function(){
            return this.name ? this.name : MobiRouter.currentRouteName();
        },
        preloadedCss: function(value){
            return Boolean(value) ? 'display:none;' : '';
        }
    });

    Template.mobi_page_content.created = function(){
        var _this = this;
        MobiRouter.speak('template created, pos: '+this.data.position+', name: '+this.data.name);
        Deps.afterFlush(function(){
            MobiResizeable.resizeAllElements( function(){
                setupIscroll(_this, {mouseWheel: true});
                //MobiRouter.animateScroller();
            });
        });
    };



    /** mobi_header HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_header.helpers({
        hasBackBtn: function(){
            return MobiRouter.hasBackBtn();
        },
        backBtnText: function(){
            Meteor.setTimeout(function(){ MobiResizeable.elements.resizeTitle(); }, 10);
            return MobiRouter.backBtnText();
        },
        hasNextBtn: function(){
            return MobiRouter.hasNextBtn();
        },
        nextBtnText: function(){
            Meteor.setTimeout(function(){ MobiResizeable.elements.resizeTitle(); }, 10);
            return MobiRouter.nextBtnText();
        },
        'pageTitle': function(){
            if( !MobiRouter.settings.headerTitles ) return false;

            Meteor.setTimeout(function(){ MobiResizeable.elements.resizeTitle(); }, 10);
            return MobiRouter.getPageTitle();
        }
    });


    Template.mobi_header.events({
        'mouseup #mobi_sidebar_toggle, touchend #mobi_sidebar_toggle': function(e){
            if(!MobiRouter.sidebarShown) MobiRouter.showSidebar();
            else MobiRouter.hideSidebar();
        },
        'mouseup #header_back_btn, touchend #header_back_btn': function(e){
            MobiRouter.backBtnAction(e);
        },
        'mouseup #header_done_btn, touchend #header_done_btn': function(e){
            MobiRouter.nextBtnAction(e);
        },
    });

})();