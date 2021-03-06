(function($){

    /** mobi_router HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_router.mobi_sidebar = function(){ MobiRouter.dep.depend(); return Template.mobi_sidebar; };
    Template.mobi_router.mobi_header = function(){ MobiRouter.dep.depend(); MobiRouter.headerDep.depend(); return Template.mobi_header; };
    Template.mobi_router.mobi_content = function(){ MobiRouter.dep.depend(); return Template.mobi_content; };
    Template.mobi_router.isFooter = function(){ MobiRouter.dep.depend(); MobiRouter.footerDep.depend(); MobiResizeable.resizeAllElements(); return Boolean(MobiRouter.settings.footer); };
    Template.mobi_router.mobileClass = function(){ MobiRouter.dep.depend(); MobiRouter.backgroundDep.depend(); return isMobile || MobiRouter.showFullScreen ? 'mobile-display' : '' };

    Template.mobi_router.rendered = function(){ /*MobiRouter.configure();*/ MobiResizeable.init(true); };


    /** mobi_loading HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_loading.loading_template = function(){
        return MobiRouter.loadingTemplate();
    };


    /** mobi_sidebar HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_sidebar.sidebarContent = function(){
        //MobiRouter.dep.depend();
        Deps.afterFlush(function(){
            MobiRouter.refreshSidebarScroll();
        });
        return Template[MobiRouter.settings.sidebarTemplate];
    };


    /** mobi_sidebar HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_footer.footerContent = function(){
        MobiRouter.footerDep.depend();
        Deps.afterFlush(function(){
            MobiRouter.refreshFooterScroll();
        });
        return Template[MobiRouter.settings.footerTemplate];
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
            /*console.log('refresh iscroll form route: ', _this );
            refreshIscrolls(['pos'+_this.position+'_page_iscroll_'+_this.name]);*/
        });
        return !MobiRouter.loading() ? MobiRouter.content(_this) : null;
    };

    Template.mobi_page_content.pageData = function(){
        var data =  !_.isBoolean(this) ? this.getData(this.getPath()) : {};
        data._r = this;
        var _this = this;
        Deps.afterFlush(function(){
            //console.log('refresh iscroll form route: ', _this );
            refreshIscrolls(['pos'+_this.position+'_page_iscroll_'+_this.name]);
        });
        return data;
    };

    Template.mobi_page_content.helpers({
        name: function(){
            return this.name ? this.name : MobiRouter.currentRouteName();
        },
        preloadedCss: function(value){
            return Boolean(value) ? 'display:none;' : '';
        },
        scrollableClass: function(){
            var className = this.scrollable === true ? ' scroll-it-anyway ' : ' do-not-scroll ';
            className = this.scrollable == 'depends-on-size' ? ' scroll-if-needed ' : className;
            className = this.scrollable === false || this.scrollable == undefined ? ' do-not-scroll ' : className;
            return className;
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
            if( MobiRouter.settings.headerTitles != undefined && !Boolean(MobiRouter.settings.headerTitles)) return false;

            Meteor.setTimeout(function(){ MobiResizeable.elements.resizeTitle(); }, 10);
            return MobiRouter.getPageTitle();
        }
    });


    var mobiHeaderEvents = {};

    mobiHeaderEvents[END_EV+' #mobi_sidebar_toggle'] = function(e){
        MobiRouter.refreshSidebarScroll();
        if(!MobiRouter.sidebarShown) MobiRouter.showSidebar();
        else MobiRouter.hideSidebar();
    };
    mobiHeaderEvents[END_EV+' #header_back_btn'] = function(e){
        MobiRouter.backBtnAction(e);
    };
    mobiHeaderEvents[END_EV+' #header_done_btn'] = function(e){
        MobiRouter.nextBtnAction(e);
    };

    Template.mobi_header.events(mobiHeaderEvents);


    /** mobi_alerts HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_alerts.helpers({
        alerts: function(){
            MobiRouter.alertDep.depend();
            return _.isArray(MobiRouter.alerts) ? MobiRouter.alerts : false;
        },
    });


    /** mobi_alert_template HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_alert_template.helpers({
        buttons: function(){
            console.log(this);
            return this.buttons;
        }
    });

    Template.mobi_alert_template.rendered = function(){
        var background = this.find('.mobi_alert_background');
        var box = this.find('.mobi_alert_box');
        MobiResizeable.centralizeAbs(background, box);
    };


    /** mobi_alert_button HELPERS, EVENTS & CALLBACKS **/

    var mobiAlertEvents = {};
    mobiAlertEvents[END_EV+' .mobi_alert_button'] = function(){
        MobiRouter.closeAlert();

        if( _.isFunction(this.action) )
            this.action();
    };

    Template.mobi_alert_button.events(mobiAlertEvents);

    Template.mobi_alert_button.rendered = function(){
        var button = this.find('.mobi_alert_button'),
            buttonContainer = button.parentNode;

        allocateHorizontalSpace(buttonContainer);
    };



    /** mobi_popup_selects HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_popup_select.helpers({
        selects: function(){
            MobiRouter.popupSelectsDep.depend();
            return _.isObject(MobiRouter.popupSelects) ? _.values(MobiRouter.popupSelects) : false;
        },
    });

    /** mobi_popup_select_template HELPERS, EVENTS & CALLBACKS **/

    Template.mobi_popup_select_template.helpers({
        options: function(){
            return _.values(this.options);
        },
        closeBtnClass: function(){
            return !!this.closeBtn ? 'has-close-btn' : '';
        }
    });

    Template.mobi_popup_select_template.rendered = function(){
        var background = this.find('.mobi_popup_select_background');
        var box = this.find('.mobi_popup_select_box');

        MobiResizeable.centralizeAbs(background, box);

        var wrapper = this.find('#popup-select-'+this.data.id);
        if( !wrapper ) return false;

        MobiRouter.addPopupIScroll(this.data.id, this.data.iScroll);
    };

    var tmpEvents = {};
    tmpEvents[END_EV+' .mobi_popup_select_close'] = function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        var target = e.target;
        while (!target.className.match('mobi_popup_select_background')) target = target.parentNode;
        this.onClose();
    };

    Template.mobi_popup_select_template.events(tmpEvents);

    var tmpEvents = {};
    tmpEvents[END_EV+' .mobi_popup_select_option'] = function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        MobiRouter.popupOptionSelected(e, this);
    };
    Template.mobi_popup_select_option.events(tmpEvents);

})(jQuery);
