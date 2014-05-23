(function(){

    /** mobi_tableview_link HELPERS, EVENTS & CALLBACKS **/

    var mobiTableviewLinkEvents = {};

    mobiTableviewLinkEvents[START_EV+' .action-btn'] = function(e) {
        e.preventDefault();
        if(!mobileScrolling){
            $(e.currentTarget).addClass('touched');
        }
    };
    mobiTableviewLinkEvents[END_EV+' .action-btn'] = function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        $('.touched').removeClass('touched');
        if(_.isFunction(this.linkBtnAction) && !mobileScrolling)
            this.linkBtnAction(e, false);
    };

    mobiTableviewLinkEvents[START_EV+' .tableview-link'] = function(e) {
        if( $(e.target).hasClass('tableview-link') )
            $(e.currentTarget).addClass('touched');
    };
    mobiTableviewLinkEvents[END_EV+' .tableview-link'] = function(e) {
        $('.touched').removeClass('touched');
        if(_.isFunction(this.action) && !mobileScrolling && $(e.target).hasClass('tableview-link'))
            this.action(e);
    };

    Template.mobi_tableview_link.events(mobiTableviewLinkEvents);


    /** mobi_tableview_pressable HELPERS, EVENTS & CALLBACKS **/

    var mobiTableviewPressableEvents = {};

    mobiTableviewPressableEvents[START_EV+' .action-btn'] = function(e){
        e.preventDefault();
        $(e.currentTarget).addClass('touched');
    };
    mobiTableviewPressableEvents[END_EV+' .action-btn'] = function(e){
        e.stopImmediatePropagation();
        e.preventDefault();
        $('.touched').removeClass('touched');
        if(_.isFunction(this.action) && !$(e.currentTarget).hasClass('disabled') && !mobileScrolling )
            this.action(e);
    };

    mobiTableviewPressableEvents[START_EV+' .switcher'] = function(e){
        e.preventDefault();
        $(e.currentTarget).addClass('touched');
    };
    mobiTableviewPressableEvents[END_EV+' .switcher'] = function(e){
        e.stopImmediatePropagation();
        e.preventDefault();
        $('.touched').removeClass('touched');
        if(_.isFunction(this.action) && !$(e.currentTarget).hasClass('disabled') && !mobileScrolling )
            this.action(e);
    };

    mobiTableviewPressableEvents[START_EV+' .tableview-pressable'] = function(e){
        if( $(e.target).hasClass('tableview-pressable') )
            $(e.currentTarget).addClass('touched');
    };
    mobiTableviewPressableEvents[END_EV+' .tableview-pressable'] = function(e){
        e.stopImmediatePropagation();
        e.preventDefault();
        $('.touched').removeClass('touched');
        if(_.isFunction(this.titleAction) && !mobileScrolling && $(e.target).hasClass('tableview-pressable'))
            this.titleAction(e);
    };

    Template.mobi_tableview_pressable.events(mobiTableviewPressableEvents);


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
        'stateText': function(state){
            var value = this.switchTextPosition != 'after' && this.switchTextPosition != 'before' ? false : (Boolean(state) ? 'On' : 'Off');
            return value;
        }
    });


    /** mobi_tableview_link HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_tableview_link.helpers({
        actionBtnClass: function() {
            return Boolean(this.linkBtnClass)? this.linkBtnClass : "default-btn";
        }
    });


    /** isLink HELPERS, EVENTS & CALLBACKS **/

    Template.isLink.isLink = function (type) {
        return type == undefined || type == 'link';
    };


    /** isButton HELPERS, EVENTS & CALLBACKS **/

    Template.isButton.isButton = function (type) {
        return type == 'button';
    };

})();
