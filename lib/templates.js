(function(){


/** mobi_router HELPERS, EVENTS & CALLBACKS **/

Template.mobi_router.mobi_sidebar = function(){ MobiRouter.dep.depend(); return Template.mobi_sidebar; };
Template.mobi_router.mobi_header = function(){ MobiRouter.dep.depend(); return Template.mobi_header; };
Template.mobi_router.mobi_content = function(){ MobiRouter.dep.depend(); return Template.mobi_content; };

Template.mobi_router.rendered = function(){ MobiResizeable.init(true); };



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

Template.mobi_content.slides = function() {
    MobiRouter.speak('Template.sliding_page_wrapper.slides');
    var slides = MobiRouter.getSlideStack();
    return slides.length ? slides : false;
};

Template.mobi_content.rendered = function(){
    MobiRouter.speak('"mobi_content" template rendered');
};



/** mobi_page_content HELPERS, EVENTS & CALLBACKS **/

Template.mobi_page_content.pageContent = function(){
    return MobiRouter.content(this);
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
    MobiRouter.speak('"mobi_page_content" template created');
    var _this = this;
    Deps.afterFlush(function(){
        MobiResizeable.resizeAllElements( function(){
            setupIscroll(_this);
            MobiRouter.animateScroller();
        } );
    });
};



/** mobi_header HELPERS, EVENTS & CALLBACKS **/

Template.mobi_header.helpers({
    hasBackBtn: function(){
        return MobiRouter.hasBackBtn();
    },
    backBtnText: function(){
        return MobiRouter.backBtnText();
    },
    hasNextBtn: function(){
        return MobiRouter.hasNextBtn();
    },
    nextBtnText: function(){
        return MobiRouter.nextBtnText();
    },
    'pageTitle': function(){
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


/** mobi_tableview_link HELPERS, EVENTS & CALLBACKS **/

Template.mobi_tableview_link.events({
    'mousedown .tableview-link, touchstart .tableview-link': function(e) {
        $(e.currentTarget).addClass('touched');
    },
    'click .tableview-link': function(e) {
        if(!mobileScrolling && _.isFunction(this.action))
            return this.action();
    }
});

/** mobi_tableview_pressable HELPERS, EVENTS & CALLBACKS **/

Template.mobi_tableview_pressable.events({
    'click .action-btn': function(e){
        if(_.isFunction(this.action) && !$(e.currentTarget).hasClass('disabled') )
            return this.action();
    },
    'click .switcher': function(e){
        if(_.isFunction(this.action) && !$(e.currentTarget).hasClass('disabled') )
            return this.action();
    }
});

Template.mobi_tableview_pressable.helpers({
    'activityClass': function(state){
        return state == undefined || Boolean(state) ? '' : 'disabled';
    },
    'switchState': function(state){
        return Boolean(state) ? 'onState' : 'offState';
    },
    'onText': function(){
        return _.isArray(this.buttonText) ? this.buttonText[0] : 'on';
    },
    'offText': function(){
        return _.isArray(this.buttonText) ? this.buttonText[1] : 'off';
    },
});

})();


/** isLink HELPERS, EVENTS & CALLBACKS **/

Template.isLink.isLink = function (type) {
    return type == 'link';
};

/** isButton HELPERS, EVENTS & CALLBACKS **/

Template.isButton.isButton = function (type) {
    return type == 'button';
};