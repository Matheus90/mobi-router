(function(){

    /** mobi_router HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_router.mobi_sidebar = function(){ MobiRouter.dep.depend(); return Template.mobi_sidebar; };
    Template.mobi_router.mobi_header = function(){ MobiRouter.dep.depend(); return Template.mobi_header; };
    Template.mobi_router.mobi_content = function(){ MobiRouter.dep.depend(); return Template.mobi_content; };

    Template.mobi_router.rendered = function(){ MobiResizeable.init(true); };


    /** mobi_loading HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_loading.loading_template = function(){
        return MobiRouter.loadingTemplate();
    }


    /** mobi_sidebar HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_sidebar.sidebarContent = function(){
        Deps.afterFlush(function(){
            MobiRouter.refreshSidebarScroll();
        });
        return Template[MobiRouter.settings.sidebarTemplate];
    };

    Template.mobi_sidebar.events({
        'mousedown #mobi_sidebar, touchstart #mobi_sidebar': function(e) {
            $(e.currentTarget).addClass('touched');
        },
        'click #mobi_sidebar': function(e) {
            if(mobileScrolling){
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
    });



    /** mobi_content HELPERS, EVENTS & CALLBACKS **/

    var firstLoad = true;

    Template.mobi_content.slides = function() {
        MobiRouter.speak('Template.sliding_page_wrapper.slides');
        var slides = MobiRouter.getSlideStack();
        if( slides.length && firstLoad && MobiRouter.storedRoutes().length){
            firstLoad = false;
            MobiRouter.jumpToPosition();
            Meteor.setTimeout(function(){MobiRouter.loading(false);}, MobiRouter.settings.minLoadingTemplateTime);
        }else if( slides.length )
            MobiRouter.animateScroller();
        return slides;
    };

    Template.mobi_content.rendered = function(){
        MobiRouter.speak('"mobi_content" template rendered');
    };



    /** mobi_page_content HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_page_content.pageContent = function(){
        var _this = this;
        Deps.afterFlush(function(){
            MobiResizeable.elements.resizeTitle();
            refreshIscrolls(['pos'+_this.position+'_page_iscroll_'+_this.name]);
        });
        return !MobiRouter.loading() ? MobiRouter.content(this) : null;
    };

    Template.mobi_page_content.pageParams = function(){
        return _.extend(this, this.getData(this.getPath()));
    };

    Template.mobi_page_content.helpers({
        name: function(){
            return this.name ? this.name : MobiRouter.currentRouteName();
        }
    });

    Template.mobi_page_content.created = function(){
        var _this = this;
        MobiRouter.speak('template created, pos: '+this.data.position+', name: '+this.data.name);
        Deps.afterFlush(function(){
            MobiResizeable.resizeAllElements( function(){
                setupIscroll(_this);
                Meteor.setTimeout(function(){ MobiRouter.animateScroller(); }, 100);
            });
        });
    };



    /** mobi_header HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_header.helpers({
        hasBackBtn: function(){
            return MobiRouter.hasBackBtn();
        },
        backBtnText: function(){
            MobiResizeable.elements.resizeTitle();
            return MobiRouter.backBtnText();
        },
        hasNextBtn: function(){
            return MobiRouter.hasNextBtn();
        },
        nextBtnText: function(){
            MobiResizeable.elements.resizeTitle();
            return MobiRouter.nextBtnText();
        },
        'pageTitle': function(){
            MobiResizeable.elements.resizeTitle();
            return MobiRouter.getPageTitle();
        }
    });


    Template.mobi_header.events({
        'click #mobi_sidebar_toggle': function(e){
            if(!MobiRouter.sidebarShown) MobiRouter.showSidebar();
            else MobiRouter.hideSidebar();
        },
        'click #header_back_btn': function(e){
            MobiRouter.backBtnAction(e);
        },
        'click #header_done_btn': function(e){
            MobiRouter.nextBtnAction(e);
        },
    });

})();