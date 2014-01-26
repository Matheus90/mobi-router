(function(Template){

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
    Meteor.setTimeout(function(){
        MobiRouter.initScrolls();
    }, 100);
};


/** mobi_page_content HELPERS, EVENTS & CALLBACKS **/

Template.mobi_page_content.helpers({
    'content': function(){
        if( !MobiRouter.isSequence() )
            return MobiRouter.content();

        var page = Session.get('actual_page'),
            data = Session.get('actual_data');
        return Template[this.template](data);
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
    'pageTitle': function(){ return MobiRouter.getPageTitle(); }
});

touchEventStarted = 0;
Template.mobi_header.events({
    'mousedown #mobi_sidebar_toggle, touchstart #mobi_sidebar_toggle': function(e){
        touchEventStarted = e.type == 'touchstart' ? +(new Date) : 0;

        if(!MobiRouter.sidebarShown) MobiRouter.showSidebar();
        else MobiRouter.hideSidebar();

        e.preventDefault();
    },
    'mousedown #header_back_btn, touchstart #header_back_btn': function(e){
        MobiRouter.prev();
    },
    'mousedown #header_done_btn, touchstart #header_done_btn': function(e){
        MobiRouter.next();
    },
});



/** sliding_page_wrapper HELPERS, EVENTS & CALLBACKS **/

Template.sliding_page_wrapper.helpers({
    slides: function() {
        clearScrolls(); //iScrolls need to be cleared cuz dead elements with the same IDs will be controlled by old iScroll calls
        return MobiRouter.getSlideStack(); //getSlideGroupTemplates(Session.get('step_type'));
    },
    renderSlide: function(slide) {
    }
});

Template.sliding_page_wrapper.rendered = function() {
    MobiRouter.speak('"sliding_page_wrapper" template rendered');
    mobiResizeable.resizeAllElements();
    Meteor.setTimeout( function(){ MobiRouter.animateScroller(); }, 200);
};

})(Template);