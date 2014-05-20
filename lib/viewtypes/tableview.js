(function(){

    /** mobi_tableview_link HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_tableview_link.events({
        'mousedown .action-btn, touchstart .action-btn': function(e) {
            if(!mobileScrolling){
                e.stopImmediatePropagation();
                e.preventDefault();
                $(e.currentTarget).addClass('touched');
            }
        },
        'click .action-btn, touchend .action-btn': function(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            if(_.isFunction(this.linkBtnAction) && !mobileScrolling)
                this.linkBtnAction(e, false);
        },
        'mousedown .tableview-link, touchstart .tableview-link': function(e) {
            if(_.isFunction(this.action) && !mobileScrolling)
                $(e.currentTarget).addClass('touched');
        },
        'click .tableview-link, touchend .tableview-link': function(e) {
            if(_.isFunction(this.action) && !mobileScrolling)
                this.action(e);
            $(e.currentTarget).removeClass('touched');
        }
    });


    /** mobi_tableview_pressable HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_tableview_pressable.events({
        'mousedown .action-btn, touchstart .action-btn': function(e){
            if(!mobileScrolling){
                e.stopImmediatePropagation();
                e.preventDefault();
                $(e.currentTarget).addClass('touched');
            }
        },
        'click .action-btn, touchend .action-btn': function(e){
            e.stopImmediatePropagation();
            e.preventDefault();
            if(_.isFunction(this.action) && !$(e.currentTarget).hasClass('disabled') && !mobileScrolling )
                this.action(e);
        },
        'mousedown .switcher, touchstart .switcher': function(e){
            if(!mobileScrolling){
                e.stopImmediatePropagation();
                e.preventDefault();
                $(e.currentTarget).addClass('touched');
            }
        },
        'click .switcher, touchend .switcher': function(e){
            e.stopImmediatePropagation();
            e.preventDefault();
            if(_.isFunction(this.action) && !$(e.currentTarget).hasClass('disabled') && !mobileScrolling )
                this.action(e);
        },
        'mousedown .tableview-pressable, touchstart .tableview-pressable': function(e) {
            if(_.isFunction(this.titleAction) && !mobileScrolling)
                $(e.currentTarget).addClass('touched');
        },
        'click .tableview-pressable, touchend .tableview-pressable': function(e) {
            if(_.isFunction(this.titleAction) && !mobileScrolling)
                this.titleAction(e);
            $(e.currentTarget).removeClass('touched');
        },
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
