(function(){

    /** mobi_tableview_link HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_tableview_link.events({
        'mousedown .tableview-link, touchstart .tableview-link': function(e) {
            $(e.currentTarget).addClass('touched');
        },
        'mouseup .tableview-link, touchend .tableview-link': function(e) {
            if(_.isFunction(this.action))
                return this.action();
        },
        'mousedown .action-btn, touchstart .action-btn': function(e) {
            $(e.currentTarget).removeClass('touched');
        },
        'mouseup .action-btn, touchend .action-btn': function(e) {
            if(_.isFunction(this.linkBtnAction)){
                return this.linkBtnAction(e, false);
            }
        }
    });


    /** mobi_tableview_pressable HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_tableview_pressable.events({
        'mouseup .action-btn, touchend .action-btn': function(e){
            if(_.isFunction(this.action) && !$(e.currentTarget).hasClass('disabled') )
                return this.action();
        },
        'mouseup .switcher, touchend .switcher': function(e){
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
        'stateText': function(state){
            var value = this.switchTextPosition != 'after' && this.switchTextPosition != 'before' ? false : (Boolean(state) ? 'On' : 'Off');
            console.log(value, Template);
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
