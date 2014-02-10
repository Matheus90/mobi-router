(function(){

/** mobi_router HELPERS, EVENTS & CALLBACKS **/

Template.mobi_router.rendered = function(){
    mobiResizeable.init(true);
};


/** mobi_sidebar HELPERS, EVENTS & CALLBACKS **/

Template.mobi_sidebar.helpers({
    'sidebar': function(){ return MobiRouter.sidebar(); },
});

Template.mobi_sidebar.rendered = function(){
    MobiRouter.refreshSidebarScroll();
};



/** mobi_content HELPERS, EVENTS & CALLBACKS **/

Template.mobi_content.helpers({
    'routeObj': function(){ return MobiRouter.actualRoute(); },
});

Template.mobi_content.rendered = function(){
    MobiRouter.speak('"mobi_content" template rendered');
    Deps.afterFlush(function(){
        MobiRouter.initScrolls();
    });
};


/** mobi_page_content HELPERS, EVENTS & CALLBACKS **/

Template.mobi_page_content.helpers({
    'content': function(){
        return MobiRouter.content(this);
    },
    'name': function(){
        return this.name ? this.name : MobiRouter.currentRouteName();
    }
});

Template.mobi_page_content.rendered = function(){
    MobiRouter.speak('"mobi_page_content" template rendered');
    var _this = this;
    Meteor.setTimeout(function() {
        setupIscroll(_this);
    }, 20);
};



/** mobi_header HELPERS, EVENTS & CALLBACKS **/

Template.mobi_header.helpers({
    hasBackBtn: function(){
        return MobiRouter.hasBackBtn();
    },
    hasNextBtn: function(){
        return MobiRouter.hasNextBtn();
    }
    //'pageTitle': function(){ return MobiRouter.getPageTitle(); }
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


/** sliding_page_wrapper HELPERS, EVENTS & CALLBACKS **/

Template.sliding_page_wrapper.helpers({
    slides: function() {
        MobiRouter.dep.depend();
        MobiRouter.speak('Template.sliding_page_wrapper.slides');
        clearScrolls(); //iScrolls need to be cleared cuz dead elements with the same IDs will be controlled by old iScroll calls
        return MobiRouter.getSlideStack(); //getSlideGroupTemplates(Session.get('step_type'));
    },
    renderSlide: function(slide) {
        MobiRouter.dep.depend();
        return Template.mobi_page_content(slide);
    }
});

Template.sliding_page_wrapper.rendered = function() {
    MobiRouter.speak('"sliding_page_wrapper" template rendered');
    Deps.afterFlush(function(){
        mobiResizeable.resizeAllElements();
    });
};

Template.sliding_page_wrapper.created = function() {
    MobiRouter.speak('"sliding_page_wrapper" template created');
    Deps.afterFlush(function(){
        mobiResizeable.resizeAllElements( function(){ MobiRouter.animateScroller(false, 10); } );
    });
};

})();