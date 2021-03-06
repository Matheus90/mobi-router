(function($) {
    MRouter = function(){

        // Centralized speaking funtion for Mobi-Router
        this.speak = function(message){
            if( this.settings && !this.settings.canISpeak ) return false;
            if(_.isObject(message))
                console.log('Mobi-Router', message);
            else
                console.log('Mobi-Router: '+message);
        };

        // Default settings for Mobi-Router
        var _settings = {
            canISpeak: false,
            defaultBackBtnAction: function(){ MobiRouter.back(); },
            defaultBackBtnText: 'Back',
            defaultNextBtnAction: function(){ MobiRouter.next(); },
            defaultNextBtnText: 'Next',
            defaultTitle: 'Mobi-Router',
            desktopHeight: 480,
            desktopWidth: 840,
            footer: false,
            footerHeight: 65,
            footerIScroll: false,
            footerTemplate: 'footer',
            headerHeight: 45,
            headerTitles: true,
            loadingTemplate: false,
            minLoadingTemplateTime: 1000,
            before: function(){},
            afterRender: function(){},
            afterAnimate: function(){},
            afterLoadAction: function(){},
            pageMoveTime: 600,
            pageMoveEasing: 'easeInOutBack',
            sidebar: true,
            sidebarDefaultWidth: 200,
            sidebarMoveEasing: 'easeOutExpo',
            sidebarMoveTime: 600,
            sidebarToggleBtn: 45,
            useTouchEvents: true,
            afterResizeFunction: function(){}
        };
        this.settings = {};

        // Storing sizes of page elements
        this.sizes = {
            router: {width: 0, height: 0},
            sidebar: {width: 0, height: 0},
            main: {width: 0, height: 0},
            header: {width: 0, height: 0},
            footer: {width: 0, height: 0},
            content: {width: 0, height: 0},
        };

        // Sidebar visibility
        this.sidebarShown = false;

        // Main content translate coords
        this.mainTranslateX = 0;

        // Is the site shown on full screen
        this.showFullScreen = false;

        // status of MobiRouter while stands up
        var _loading = true;

        // iScroll handler for sidebar
        var _sidebarIScroll;

        // iScroll handler for footer
        var _footerIScroll;

        // This is the original storage of routes
        var _routeMap = {};

        // Storage of prev/actual/next paths
        var _routes = {};

        // Storage of page sequences, each sequence works like a separate slider.
        // It's an opportunity to create sign up sequences or sth. else that can be passed from left to right trough slides
        //var _sequences = {};

        var _sequence = [];
        var _nextSequence = [];
        var _position = 0;

        var _goingSomewhere = false;
        var _animationRunning = false;
        var _stopped = false;

        // It's a sequence full of moving values for the animateScroller() function
        //var _animationSequence = [];

        this.dep = new Deps.Dependency;
        this.footerDep = new Deps.Dependency;
        this.headerDep = new Deps.Dependency;
        this.backgroundDep = new Deps.Dependency;

        // Alert system tools
        this.alerts = [];
        this.alertDep = new Deps.Dependency;

        // Popup system tools
        this.popupSelects = {};
        this.popupSelectsDep = new Deps.Dependency;
        this.popupSelectIScrolls = {};

        // Store custom views like "tableview" and "detailview"
        var _customViews = {
            TableView: 'mobi_tableview',
            //DetailView: 'mobi_detailview',
        };

        /*******************************************************************************************************************
         **************************************  PRIVATE functions  ********************************************************
         ******************************************************************************************************************/


        /**
         * Protected init function, runs after configure() ends
         *
         * @private
         */
        function _init(){
            var _this = this;
            if( document.readyState != 'complete' ){
                Meteor.setTimeout(function(){
                    return _init.call(_this);
                }, 25);
                return;
            }
            this.speak('initializing');

            _goingSomewhere = _animationRunning = _stopped = false;

            Meteor.startup(function(){
                var routes = _getSequenceFromUrl.call(_this);
                var route = routes.length ? _.last(routes) : false;
                _startNewSequence.call(_this, route, routes);
            });
        };


        function _onReady(value, callback){
            if( !_isReady(value) ){
                Meteor.setTimeout(function(){
                    _onReady.call(this, value, callback);
                }.bind(this), 100);
            }else{
                if( _.isFunction(callback) )
                    callback.call(this);
            }
        };

        function _isReady(value){
            return _.isFunction(value) ? value() : value;
        };


        this.sidebarAnimationCSS = function(){

            var styleSheet = document.getElementById('sidebar-animation');
            if( !styleSheet ) return;

            styleSheet.innerHTML = '' +
                '#mobi_main {' +
                'transition: '+(this.settings.sidebarMoveTime/1000)+'s ease-in-out !important;'+
                '-webkit-transition: '+(this.settings.sidebarMoveTime/1000)+'s ease-in-out !important;'+
                '-moz-transition: '+(this.settings.sidebarMoveTime/1000)+'s ease-in-out !important;'+
                '-o-transition: '+(this.settings.sidebarMoveTime/1000)+'s ease-in-out !important;' +
                '}' +
                '#mobi_router.sidebar-opened #mobi_main {' +
                'transform: translateX('+(this.sizes.sidebar.width)+'px) !important;'+
                '-ms-transform: translateX('+(this.sizes.sidebar.width)+'px) !important;' + /* IE 9 */
                '-webkit-transform: translateX('+(this.sizes.sidebar.width)+'px) !important;' + /* Opera, Chrome, and Safari */
                '}';

        }


        /**
         * Check if the route exists, return the route if it does and return false if not
         *
         * @param name
         * @returns {MobiRoute|false}
         * @private
         */
        function _getRoute(name){
            var route;
            if( !name )
                route = _sequence.length ? (_sequence[MobiRouter.currentPosition()] || false ) : false;
            name = name ? name : Session.get('actual_page');
            route = route || _routeMap[name];
            if( route )
                return route;
            else
                return false;
        };


        /**
         *  Get the value of a variable, no matters if it's a function or any object
         *
         * @param variable
         * @param context
         * @param params
         * @returns {*}
         * @private
         */
        function _getValue(variable, context, params){
            if( _.isFunction(variable) )
                return variable.call(context, params);
            else
                return variable;
        };


        /**
         * Set the actually opened page's menu item to active
         *
         * @param name
         * @returns {*}
         * @private
         */
        function _setMenuItemActive(name){
            name = name || (_sequence.length ? _sequence[0].name : false);
            if( !name || name == undefined ) return name;

            _.each(document.getElementsByClassName('active_sidebar_item'), function(item){
                item.className = item.className.replace(' active_sidebar_item', '');
            });
            _.each(document.getElementsByClassName('menu_item_'+name), function(item){
                item.className += ' active_sidebar_item';
            });

            return name;
        };


        /**
         * Generate sequence from the current/given url
         *
         * @param url
         * @returns {Array}
         * @private
         */
    function _getSequenceFromUrl(url) {
      var pathname = url || window.location.pathname,
        route = _findCurrentRoute(_routeMap, pathname);

      if(!route){
                route = new MobiRoute('pageNotFound', {
                    path: pathname,
                    cleanPath: pathname,
                    urlParams: [],
                    params: {},
                    defaultTitle: MobiRouter.notFoundTitle(),
                    template: MobiRouter.notFoundTemplate(),
                });
      }

      route.params = route.setParams(pathname);

      if(_.isArray(route.defaultPreviousRoutes)) {
        var defaultPreviousRoutes = _.map(route.defaultPreviousRoutes, function(routeName) {
          var previousRoute = new MobiRoute(routeName, _routeMap[routeName]);

          previousRoute.setParamsFromCurrentRoute(route);

          this.pushToHistoryStack(previousRoute.name, previousRoute.params);
          return previousRoute;
        }.bind(this));
      }
      else var defaultPreviousRoutes = [];

      this.pushToHistoryStack(route.name, route.params);

      defaultPreviousRoutes.push(route);
      return defaultPreviousRoutes;
    }

    //NOT USED ANYMORE, BUT LET'S SAVE IT IN CASE WE NEED ANTHING FROM HERE, FOR NOW.
        function _getSequenceFromUrlOLD(url){
            var pathname = url || window.location.pathname,
                initialPathname = pathname, // Need to store it for pageNotFound
                loc = pathname.split('/'),  // array used for loop through the whole pathname
                routes = [],                // storage of routes
                paramPos = 0,               // track position of routes' parameters
                absPos = 0,                 // track the position in the pathname
                isRoute = false,            // route found flag
                cutOff = '',                // part of the pathname to be cut off
                pageNotFound = false;


            _.each(loc, function(param, pos){
                if( pathname == '' || absPos > pos || pageNotFound ) return false;
                isRoute = false;
                cutOff = '';

                _.each(_routeMap, function(route, name){
                    //var r = jQuery.extend(true, {}, route);
                    var r = new MobiRoute(name, route);
                    if( pathname == '' || isRoute == true || (r.cleanPath == '/' &&  pos > 0) ) return false;
                    if( pathname == r.cleanPath || pathname.indexOf(r.cleanPath+'/') == 0 ){
                        r.position = routes.length;
                        routes.push(r);
                        isRoute = true;
                    }
                });

                if( isRoute == true ){
                    paramPos = 0;
                    absPos += _.compact((_.last(routes).cleanPath).split('/')).length;
                    cutOff = _.last(routes).cleanPath;
                }else if(routes.length){
                    var r = _.last(routes),
                        paramName = r.urlParams[paramPos];
                    if( r.urlParams[paramPos] || param == '' ){
                        paramPos += 1;
                        absPos += 1;
                        cutOff = ('/'+loc[absPos]);
                        if( paramName ) _.last(routes).params[paramName] = loc[absPos];
                    }else
                        pageNotFound = true;
                }

                // Cut off the processed part of the url
                cutOff = cutOff.replace(/\/$/, '');
                pathname = pathname.slice(cutOff.length);
            });

            // Allow to start sequence with any route
            // (required if one of the routes has "/" as cleanPath)
            if( routes.length > 1 && routes[0].cleanPath == '/' && _.isEmpty(routes[0].params) )
                routes.shift();

            if( pageNotFound ){
                var route = new MobiRoute('pageNotFound', {
                    path: initialPathname,
                    cleanPath: initialPathname,
                    urlParams: [],
                    params: {},
                    defaultTitle: MobiRouter.notFoundTitle(),
                    template: MobiRouter.notFoundTemplate(),
                });
                routes = [route];
            };

      console.log('SEQUENCE', routes);
            return routes;
        }


    //calculate all route matching scores and return an object containing the route with the highest score
    function _findCurrentRoute(routeMap, url){
      var bestMatchingRoute = _.max(routeMap, function(route, name) {
        return route.getRouteMatchScore(url);
      });

      return bestMatchingRoute.getRouteMatchScore(url) > 0 ? bestMatchingRoute : false;
    }


        /**
         * Centralized way to set position in the sequence
         *
         * @param pos
         * @private
         */
        function _setPosition(pos, triggerChangeTime){
            this.speak('set position to "'+pos+'"');
            _position = pos;
            triggerChangeTime = _.isNumber(triggerChangeTime) ? triggerChangeTime : 0;
            Meteor.setTimeout(function(){
                MobiRouter.dep.changed();
                MobiRouter.footerDep.changed();
                MobiRouter.headerDep.changed();
            }, triggerChangeTime);
        };


        /**
         * Calculating the url from the actual sequence
         *
         * @returns {string}
         * @private
         */
        function _calculateUrl(sequence){
            sequence = sequence || _sequence;
            var url = '';

      sequence = [_.last(sequence)]; //generate the URL just from the last param now -JAMES

            _.each(sequence, function(route, key){
                if( Boolean(route.preloaded) ) return false;

                var path = !_.isBoolean(route) ? route.getPath() : '';
                url += path != '/' ? path : '';
            });

            return String(url ? url : '/');
        };


        /**
         * Refreshing the address line of the browser
         *
         * @private
         */
        function _refreshUrl(sequence){
            var url = _calculateUrl.call(this, sequence);
            var title = this.getPageTitle();
            title = this.settings.defaultTitle +' - '+ title;
            this.speak('refreshing url, title: '+title+', url: '+url);
            if( this.settings.allowPageTitleOverride !== false ) document.title = title;
            if ( this.settings.updateUrl !== false ) window.history.pushState({}, title, url);
        };


        function _showRoutes(nextRoute, startNewSequence, slide){
            var routes = _.clone(_sequence),
                routesInUse = routes.splice(0, slide+1);
            var newSeq = [],
                c = 0;

            _.each(routesInUse, function(r){
                if( Boolean(startNewSequence) )
                    r = _.extend(r, {preloaded: true, position: c});

                newSeq.push(r);
                c++;
            });

            var routeFound = false;
            _.each(routes, function(r){
                if( r.name == nextRoute.name && !routeFound )
                    r = _.extend(r, _.extend(nextRoute, {preloaded: false, position: c}));
                else
                    r = _.extend(r, {preloaded: true, position: c});

                newSeq.push(r);
                c++;
            });

            return newSeq;
        }

        function _removePreloadedRoutes(exceptionRoute, startNewSequence){
            var newSeq = [],
                c = 0;

            _.each(_sequence, function(r){
                if( Boolean(startNewSequence) && r.name == exceptionRoute.name )
                    newSeq.push(_.extend(r, _.extend(exceptionRoute, {preloaded: false, position: c})));
                else if( r.name == exceptionRoute.name )
                    newSeq.push(_.extend(r, _.extend(exceptionRoute, {preloaded: false, position: c})));
                else if( !Boolean(startNewSequence) && !Boolean(r.preloaded) )
                    newSeq.push(_.extend(r, {position: c}));
                c++;
            });

            return newSeq;
        }


        function _preloadRoutes(route, cb){
            var routesToPreload = route && route.routesToPreload ? route.routesToPreload : {},
                _this = this,
                sequence = _.clone(_sequence);

            sequence = _removePreloadedRoutes.call(this, {}, false);
            var oldSeq = _.clone(sequence);
            oldSeq.splice(0, (!!route ? route.position : 0) +1);

            var preload = {};
            _.each(_routeMap, function(r){
                if( Boolean(r.preload) ){
                    preload[r.name] = _.isObject(r.params) ? r.params : {};
                }
            });

            var len = (!!route ? route.position: 0)+1;
            routesToPreload = _.extend(routesToPreload, preload);
            _.each(routesToPreload, function(r, id){
                var route = _getRoute.call(_this, id);
                if( !route ) return false;
                var usedRoutes = [];
                _.each(oldSeq, function(oR){ usedRoutes.push(oR.name); });

                if( usedRoutes.indexOf(id) != -1 ) return false;

                var route = new MobiRoute(id, route);
                route.params = r;
                route.preloaded = true;
                route.position = len;
                sequence.push(route);
            });

            _sequence = sequence;

            this.dep.changed();

            if(_.isFunction(cb) )
                cb.call(this);
        }


        function _isPreloaded(route){
            var preloaded = false;
            var sequence = _.clone(_sequence);
            sequence = sequence.splice(route.position-1, sequence.length);
            _.each(sequence, function(s){
                if( s.name == route.name ) preloaded = true;
            });
            //console.log('"'+route.name+'" preloaded:', preloaded);
            return preloaded;
        }

        function _routesToDisplay(){
            var routes = [];
            _.each(_sequence, function(r){
                if( !Boolean(r.preloaded) )
                    routes.push(r);
            });

            return routes;
        }

        function _nextRoutesToDisplay(){
            var routes = [];
            _.each(_nextSequence, function(r){
                if( !Boolean(r.preloaded) )
                    routes.push(r);
            });

            return routes;
        }


        /*******************************************************************************************************************
         **************************************  PUBLIC functions  *********************************************************
         ******************************************************************************************************************/


        /**
         * Extend default settings with developer-defined ones and stores it
         *
         * @param settings
         */
        this.configure = function(settings){
            _settings = _.extend(_settings, settings);
            this.settings = _.extend(_settings, settings);
            this.speak('configuration saved');

            this.calculateSizes();

            if(isMobile) ClickBuster.init();

            _init.call(this);
        };


        /**
         * Add custom view types such as "TableView" or "DetailView"
         *
         * @param types
         */
        this.setViewTypes = function(types){
            if( _.isObject(types) )
                _.extend(_customViews, types);
        };


        /**
         * Storing the map given by developer
         *
         * @param map
         * @returns {boolean}
         */
        this.map = function(map){
            this.speak('saving router-map');
            _.each(map, function(route, name){
                _routeMap[name] = new MobiRoute(name, route);
            });
            return true;
        };


        /**
         * Status of MobiRouter
         *
         * @returns {boolean}
         */
        this.loading = function(value){
            this.dep.depend();
            if( value != undefined && value != _loading){
                _loading = Boolean(value);
                this.dep.changed();
                if( !Boolean(value) && _.isFunction(this.settings.afterLoadAction) )
                    this.settings.afterLoadAction();
            }

            return this.settings.loadingTemplate != false && Boolean(_loading);
        };


        /**
         * Loading template used on first site load
         *
         * @returns {Template|null}
         */
        this.loadingTemplate = function(){
            return this.settings.loadingTemplate ? Template[this.settings.loadingTemplate] : null;
        };

        /**
         * Returns sequence created from the url given as argument. If no url was given, the actual url is used.
         *
         * @param test
         * @returns {Array}
         */
        this.readUrl = function(url){
            return _getSequenceFromUrl.call(this, url);
        };


        /**
         * Get the url calculated by the current sequence
         *
         * @returns {string}
         */
        this.getUrl = function(){
            return _calculateUrl.call(this);
        };


        /**
         *  Calculates the size of each part of the Mobi-Router layout to fit on the screen
         *
         * @param width
         * @param height
         */
        this.calculateSizes = function(){
            var _this = this,
                settings = this.settings,
                width = window.innerWidth,
                height = $(window).innerHeight();
            this.showFullScreen = isMobile || Boolean(settings.desktopWidth > width || settings.desktopHeight > height);

            this.sizes.router.width = isMobile || this.showFullScreen ? width : settings.desktopWidth;
            this.sizes.sidebar.width = settings.sidebarDefaultWidth > (width - this.settings.sidebarToggleBtn) ? (width - settings.sidebarToggleBtn) : settings.sidebarDefaultWidth;

            if( isMobile ) this.sizes.router.height = this.sizes.sidebar.height = this.sizes.main.height = height;
            else this.sizes.router.height = this.sizes.main.height = this.sizes.sidebar.height = this.showFullScreen ? height : settings.desktopHeight;

            this.sizes.main.width = this.sizes.router.width;

            this.sizes.header.height = settings.headerHeight || 45;
            this.sizes.footer.height = !!settings.footer ? (!!settings.footerHeight ? settings.footerHeight : 45) : 0;
            this.sizes.header.width = this.sizes.main.width;
            this.sizes.footer.width = this.sizes.main.width;
            this.sizes.content.width = this.sizes.main.width;
            this.sizes.content.height = this.sizes.main.height - this.sizes.header.height - this.sizes.footer.height;

            //this.sidebarAnimationCSS();

            return this.sizes;
        };


        /**
         *  Refresh sidebar iScroll if exists and create it if not
         */
        this.refreshSidebarScroll = function(){
            var _this = this;
            if( _sidebarIScroll ){
                _sidebarIScroll.refresh();
            }else if( document.getElementById('mobi_sidebar') ){
                Meteor.setTimeout(function(){
                    if( !_sidebarIScroll ){
                        _sidebarIScroll = newScroll('mobi_sidebar', {vScroll: true});
                    }else
                        _sidebarIScroll.refresh();
                }, 50);
            }else Meteor.setTimeout(function(){ _this.refreshSidebarScroll(); }, 50);
        };

        /**
         *  Refresh footer iScroll if exists and create it if not
         */
        this.refreshFooterScroll = function(){
            if( !this.settings.footerIScroll ) return false;

            var _this = this;
            if( _footerIScroll ) _footerIScroll.refresh();
            else if( document.getElementById('mobi_footer') ) Meteor.setTimeout(function(){ _footerIScroll = newScroll('mobi_footer', {hScroll: true}); _footerIScroll.refresh();}, 100);
            else Meteor.setTimeout(function(){ _this.refreshFooterScroll(); }, 50);
        };


        /**
         *  Initializing and/or Refreshing iScrolls of the sidebar and the pages
         */
        this.initScrolls = function(){
            this.refreshScrolls();
        };
        /**
         *  Initializing and/or Refreshing iScrolls of the sidebar and the pages
         */
        this.refreshScrolls = function(){
            this.speak('initializing/refreshing iScrolls');

            this.refreshSidebarScroll();
            this.refreshFooterScroll();
            Meteor.setTimeout(refreshIscrolls, 250);
        };

    /** RECENT STUFF ADDED BY JAMES TO PREVENT SCROLLER FROM BEING STUCK WHEN IOS KEYBOARD COMES OUT **/

    this.getCurrentIscroll = function() {
      var id = $('.scroll-it-anyway').last().attr('id');
      return window.iScrollElements[id];
    };


    this.getCurrentScroller = function() {
      return $('.scroll-it-anyway').last().find('.scroller');
    };


    /** END JAMES STUFF **/

        this.mobileScrolling = function(){
            return mobileScrolling;
        };


        /**
         *  Stop actual go/_startNewSequence to be able to redirect to another route
         */
        this.stop = function(){
            _stopped = true;
        };


    /** FEATURES TO SUPPORT WINDOW.POPSTATE **/
    this.pushToHistoryStack = function(routeName, params) {
      this._previousRoutes = this._previousRoutes  || [];
      var newRoute = {name: routeName, params: params}
      if(this._previousRoutes.length > 0) {
        var previousRoute = this._previousRoutes[this._previousRoutes.length - 1];

        if(JSON.stringify(previousRoute) === JSON.stringify(newRoute)) return false; //return if route is already on stack
      }
      this._previousRoutes.push(newRoute);
      history.pushState(newRoute, null);
      return true;
    };

        /**
         * It's the common function to display another page.
         *
         * @param routeName
         * @param params
         * @param pushToStack
         */
        this.go = function(routeName, params, pushToStack){
            var _this = this;

      //return if route is the same, i.e. from quick clicks on the same linking element -JAMES
      if(!this.pushToHistoryStack(routeName, params)) return;


            if( _goingSomewhere == true || _animationRunning == true){
                Meteor.setTimeout(function(){ _this.go(routeName, params, pushToStack); }, 50);
                return false;
            }

            _goingSomewhere = _animationRunning = true;
            pushToStack = pushToStack || false;
            var r = _getRoute(routeName);
            if( !r ){ console.log('Error: This route does not exists.'); }

            var route = _.clone(r);

            if( _.isBoolean(route) )
                route = new MobiRoute('pageNotFound', {
                    path: window.location.pathname,
                    urlParams: [],
                    params: {},
                    defaultTitle: MobiRouter.notFoundTitle(),
                    template: MobiRouter.notFoundTemplate(),
                });

            // Fill the parameters of route
            if( params !== true && _.isObject(params) )
                route.params = params;
            else if( params == 'url' )
                route.params = route.getUrlParameters();
            else
                route.params = {};

            _onReady(function(){ //this callback is called every 100ms until it returns true! -JAMES
        if(_.isFunction(this.settings.waitOn))
          this._globalWaitOnPromise = this._globalWaitOnPromise || this.settings.waitOn(); //store the waitOn promise obj once

        if(_.isFunction(route.waitOn))
          this._routeWaitOnPromise = this._routeWaitOnPromise || route.waitOn(); //becaues it takes a few ms to be ready() ;)

        var globalWaitOn = _.isObject(this._globalWaitOnPromise) ? this._globalWaitOnPromise.ready() : true,
          routeWaitOn = _.isObject(this._routeWaitOnPromise) ? this._routeWaitOnPromise.ready() : true;

        if(globalWaitOn && routeWaitOn) {
          this._globalWaitOnPromise = null; //set them to null, so the waitOn promise can be set for next route change
          this._routeWaitOnPromise = null;
          return true;
        }
        return false;
            }.bind(this), function(){

                if( _.isFunction(this.settings.before) )
                    this.settings.before.call(route);
                if( _stopped ){ _stopped = _goingSomewhere = _animationRunning = false; return false; }

                if( _.isFunction(route.before) )
                    route.before();
                if( _stopped ){ _stopped = _goingSomewhere = _animationRunning = false; return false; }

                // Start new sequence of push to the existing one
                if( pushToStack === true || params === true )
                    _addToSequence.call(this, route);
                else
                    _startNewSequence.call(this, route, false, true);


                _goingSomewhere = false;

                Deps.afterFlush(function(){
                    if( _.isFunction(_this.settings.afterRender) )
                        _this.settings.afterRender();
                    if( _.isFunction(r.afterRender) )
                        r.afterRender();
                });

            }.bind(this));

        };


        function _startNewSequence(route, sequence, runAnyway){
            var _this = this;
            this.speak('start new sequence ');
            if( (_goingSomewhere == true || _animationRunning == true) && !runAnyway ){
                Meteor.setTimeout(function(){ _startNewSequence.call(_this, route, sequence); }, 50);
                return false;
            }

            _goingSomewhere = _animationRunning = true;

            _onReady(function(){
                if( runAnyway ) return true;
                var globalWaitOn = (this.settings.waitOn !== undefined ? (_.isFunction(this.settings.waitOn) ? this.settings.waitOn.call(route) : this.settings.waitOn) : true);
                var routeWaitOn = (route.waitOn !== undefined ? (_.isFunction(route.waitOn) ? route.waitOn() : route.waitOn) : true);

                //slog('_startNewSequence '+route.name+', '+globalWaitOn+', '+routeWaitOn);
                return globalWaitOn && routeWaitOn;
            }.bind(this), function(){
                if( !runAnyway && route && _.isFunction(this.settings.before) )
                    this.settings.before.call(route);
                if( _stopped ){ _stopped = _goingSomewhere = _animationRunning = false; return false; }

                if( !runAnyway && route && _.isFunction(route.before) )
                    route.before();
                if( _stopped ){ _stopped = _goingSomewhere = _animationRunning = false; return false; }

                if( sequence ){
                    _sequence = sequence;
                    this.calculateSizes();

                }else{
                    route.position = 0;
                    if( _isPreloaded(route) ){
                        _sequence = _showRoutes.call(this, route, true);
                    }else
                        _sequence = [route];
                }


                _nextSequence = _.clone(_sequence);

                // Set actual sidebar item to active (by it's class)
                _setMenuItemActive.call(this);

                _refreshUrl.call(this);
                _setPosition.call(_this, _routesToDisplay.call(_this).length-1, 50);

                if(sequence){
                    Deps.afterFlush(function(){
                        if( _.isFunction(_this.settings.afterRender) )
                            _this.settings.afterRender();
                        if( _.isFunction(route.afterRender) )
                            route.afterRender();
                    });
                    _goingSomewhere = false;
                    _preloadRoutes.call(this, route, function(){
                        this.jumpToPosition(false, true);
                    });
                }else{
                    this.animateScroller(_routesToDisplay.call(_this).length-1, false, true, function(animated){
                        _preloadRoutes.call(_this, route);

                        Meteor.setTimeout(function(){ _animationRunning = false; !animated ? MobiRouter.settings.pageMoveTime : 0});
                    });
                }
            }.bind(this));

        };


        function _addToSequence(route, data){
            this.speak('adding route DYNAMICALLY TO sequence');

            var slide = this.currentPosition(),
                oldLength = _sequence.length,
                newLength = _sequence.length,
                _this = this;


            route.position = slide+2;

            if( _isPreloaded(route) ){
                _sequence = _showRoutes.call(this, route, false, slide);
            }else{
                _sequence = _sequence.splice(0, slide+1);
                _sequence.push(route);

            }

            newLength = _sequence.length;

            _nextSequence = _.clone(_sequence);

            // Set actual sidebar item to active (by it's class)
            if( _sequence.length == 1) _setMenuItemActive.call(this);

            _refreshUrl.call(this);
            _setPosition.call(this, _routesToDisplay.call(this).length-1);
            Deps.afterFlush(function(){
                _this.animateScroller(false, false, true, function(){
                    _preloadRoutes.call(_this, route);
                    _animationRunning = false;
                });
            });
        };


        function _removeRouteAfter(pos, cb){
            var route = this[pos] || {};
            MobiRouter.speak('remove route(s) after position '+(route.position || 0)+' from sequence');
            if( _.isFunction(cb) )
                cb();
            return this.splice(0, pos+1);
        };



        /**
         * Animates the slider of the sequence to move the next position
         */
        this.animateScroller = function(pos, time, afterAnimate, cb){
            var _this = this;

            _animationRunning = true;

            pos = _.isNumber(pos) ? pos : this.currentPosition();

            var move = -(pos * this.sizes.content.width),
                time = _.isNumber(time) ? time : this.settings.pageMoveTime;

            this.speak('animating pages slider: to '+move+'px in '+time+' msec');
            if(_.isNumber(move) && _.isNumber(time) && document.getElementById('sequence_scroller') ){
                $('#sequence_scroller').hardwareAnimate({translateX: move}, time, this.settings.pageMoveEasing, function(){
                    var route = _this.currentRoute();
                    if( afterAnimate == true ){
                        if( _.isFunction(_this.settings.afterAnimate) )
                            _this.settings.afterAnimate();
                        if( route && _.isFunction(route.afterAnimate) )
                            route.afterAnimate();
                    }

                    _animationRunning = false;

                    if( route && _.isFunction(cb) )
                        cb();
                });
            }else{
                console.log('Error: move ('+move+') or time ('+time+') is not a number.');
                _animationRunning = false;
            }

        };


        /**
         * Animates the slider of the sequence to move the next position
         */
        this.jumpToPosition = function(pos, afterAnimate, cb){
            var _this = this;
            pos = _.isNumber(pos) ? pos : this.currentPosition();

            var move = -(pos * this.sizes.content.width);

            this.speak('moving pages slider to x='+move+'px');
            if(_.isNumber(move) && document.getElementById('sequence_scroller') ) {

                $('#sequence_scroller').hardwareCss('translateX('+move+'px)');

                _animationRunning = false;

                var route = _this.currentRoute();

                Meteor.setTimeout(function(){
                    if( afterAnimate == true ){
                        if( _.isFunction(_this.settings.afterAnimate) )
                            _this.settings.afterAnimate();
                        if( route && _.isFunction(route.afterAnimate) )
                            route.afterAnimate();
                    }
                }, 50);

                if( route && _.isFunction(cb) )
                    cb();
            }
            else console.log('Error: move ('+move+') is not a number');
        };


        /**
         * Rendering actual content
         *
         * @returns {html}
         */
        this.content = function(route){
            MobiRouter.dep.depend();
            var route = route || this.currentRoute();
            var viewTemplate = 'mobi_page_not_found';

            if( !route )
                return Template[this.notFoundTemplate()];
            else if( !Template[route.template] && (route.routeType == undefined || route.routeType == 'SimplePage' ) )
                return Template[this.notFoundTemplate()];
            else if( route.routeType != undefined && route.routeType != 'SimplePage' ){
                viewTemplate = _customViews[route.routeType];
                if( viewTemplate ){
                    return Template[viewTemplate];
                }else
                    return null;
            }else{
                return route.content();
            }
        };


        /**
         * Not-Found-Template from settings if specified, any other cases use the default
         */
        this.notFoundTemplate = function(){
            var tmplt = this.settings.notFoundTemplate  || 'mobi_not_found';
            return tmplt;
        };


        /**
         * Not-Found-Template from settings if specified, any other cases use the default
         */
        this.notFoundTitle = function(){
            var tmplt = this.settings.notFoundTitle  || '404, Page not found';
            return tmplt;
        };


        /**
         * Provide the current route
         *
         * @returns {MobiRoute|object}
         */
        this.currentRoute = function(){
            var sequence = _routesToDisplay.call(this);
            return sequence[this.currentPosition()];
        };


        /**
         * Provide current route's position in the sequence
         *
         * @returns {number}
         */
        this.currentPosition = function(){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            return _position;
        };


        /**
         * Provide the route's position in the sequence or return false
         *
         * @returns {number}
         */
        this.getPosition = function(routeName){
            var pos = false;
            _.each(_sequence, function(r){
                if( routeName == r.name && pos == false )
                    pos = r.position;
            });

            return pos;
        };


        /**
         * Current route's name
         *
         * @returns {string}
         */
        this.currentRouteName = function(){
            return this.currentRoute() ? this.currentRoute().name : '';
        };


        /**
         * Current route's template name
         *
         * @returns {string}
         */
        this.currentTemplate = function(){
            return this.currentRoute() ? this.currentRoute().template : (function(){});
        };


        /**
         * Renders the provided sidebar template into the position
         *
         * @returns {*}
         */
        this.sidebar = function(){
            return Template[_settings.sidebarTemplate];
        };


        /**
         * Opens the sidebar by moving the content right
         *
         * @returns {bool}
         */
        this.showSidebar = function(){
            if(this.sidebarShown) return false;
            this.speak('show sidebar');
            var _this = this;
/*
            var router = document.getElementById('mobi_router');
            if( !router ) return false;

            if( router.className.indexOf('sidebar-opened') == -1 )
                router.className += ' sidebar-opened';

            this.mainTranslateX = (this.sizes.sidebar.width - 5);
            this.sidebarShown = true;

            Meteor.setTimeout(function(){ refreshIscrolls.call(_this); }, this.settings.sidebarMoveTime);
*/

            $('#mobi_main').hardwareAnimate({translateX: Math.max(0, parseInt(this.sizes.sidebar.width - 5))}, this.settings.sidebarMoveTime, this.settings.sidebarMoveEasing, function(){
                refreshIscrolls();
                _this.mainTranslateX = (_this.sizes.sidebar.width - 5);
            });
            this.sidebarShown = true;

            return true;
        };


        /**
         * Closes the sidebar by moving the content back to the left
         *
         * @returns {bool}
         */
        this.hideSidebar = function(){
            if(!this.sidebarShown) return false;
            this.speak('hide sidebar');
            var _this = this;

/*
            var router = document.getElementById('mobi_router');
            if( !router ) return false;

            if( router.className.indexOf('sidebar-opened') != -1 )
                router.className = router.className.replace(' sidebar-opened', '');

            this.mainTranslateX = 0;
            this.sidebarShown = false;

            Meteor.setTimeout(function(){ refreshIscrolls.call(_this); }, this.settings.sidebarMoveTime);
*/

            $('#mobi_main').hardwareAnimate({translateX: 0}, this.settings.sidebarMoveTime, this.settings.sidebarMoveEasing, function(){
                refreshIscrolls();
                _this.mainTranslateX = 0;
            });
            this.sidebarShown = false;

            return true;
        };


        /**
         *  Page title calculation from actual data
         *
         * @returns {string}
         */
        this.getPageTitle = function(route){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            route = route || this.currentRoute();
            var path =  route ? route.getPath() : '';
            var data = route ? route.getData(path) : {};

            if( !route )
                var title = 'Page not found';

            title = data && data.title != undefined ? String(data.title) : (route ? route.defaultTitle : title);

            _.each(title.match(/\{:(\w+)\}/g), function(param){
                var key = param.replace('{:', '').replace('}', '');
                title = title.replace('{:'+key+'}', String(data && data[key] != undefined ? data[key] : ''));
            });

            return String(title);
        };


        /**
         * Returns a boolean value of whether the "Back" button of the sequences should be shown
         *
         * @returns {boolean}
         */
        this.hasBackBtn = function(){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            var route = this.currentRoute(),
                pos = this.currentPosition();

            if(!route)
                return false;

            return route.buttons != undefined && route.buttons.showBackButton != undefined ? Boolean(_getValue(route.buttons.showBackButton, route, {pos: pos})) : Boolean( pos > 0 );
        };


        /**
         * Returns a boolean value of whether the "Done" button of the sequences should be shown
         *
         * @returns {boolean}
         */
        this.hasNextBtn = function(){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            var route = this.currentRoute(),
                pos = this.currentPosition();

            if(!route)
                return false;

            return route.buttons != undefined && route.buttons.showNextButton != undefined ? Boolean(_getValue(route.buttons.showNextButton, route, {pos: pos})) : Boolean( pos < _nextRoutesToDisplay.call(this).length-1 );
        };


        /**
         * Developer can change the text of "Back" button by setting the "backBtnText" parameter of the page
         *
         * @returns {string|"Back"}
         */
        this.backBtnText = function(){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            var route = this.currentRoute();
            var data = route ? route.buttons : {};

            return data.backBtnText != undefined ? String(_getValue(data.backBtnText, route)) : String(_getValue(this.settings.defaultBackBtnText));
        };


        /**
         * Developer can change the text of "Done" button by setting the "doneBtnText" parameter of the page
         *
         * @returns {string|"Done"}
         */
        this.nextBtnText = function(){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            var route = this.currentRoute();
            var data = route ? route.buttons : {};

            return data.nextBtnText != undefined ? String(_getValue(data.nextBtnText, route)) : String(_getValue(this.settings.defaultNextBtnText));
        };

        /**
         *
         *
         * @param e
         * @returns {*}
         */
        this.backBtnAction = function(e){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            var route = this.currentRoute();
            var data = route ? route.buttons : {};

            return _.isFunction(data.backBtnAction) ? data.backBtnAction(e) : this.settings.defaultBackBtnAction(e);
        };


        this.nextBtnAction = function(e){
            MobiRouter.dep.depend();
            MobiRouter.headerDep.depend();
            var route = this.currentRoute();
            var data = route ? route.buttons : {};

            return _.isFunction(data.nextBtnAction) ? data.nextBtnAction(e) : this.settings.defaultNextBtnAction(e);
        };




    window.onpopstate = function(e) {
      if(!e || !e.state || !e.state.name) return;
      var routeName = e.state.name; //we dont need to do anythign with it; pop state only works if something is stored though
      MobiRouter.back();
    };

        /**
         * Public clue to move left on route sequence sliders
         *
         * @param posToMove
         * @param keepFollowings
         * @returns {boolean}
         */
        this.back = function(posToMove, keepFollowings){
            var _this = this;
            if( _animationRunning == true || _goingSomewhere == true ){
                Meteor.setTimeout(function(){ _this.back(posToMove, keepFollowings); }, 50);
                return false;
            }

      if(_.isArray(this._previousRoutes)) this._previousRoutes.pop();

            _goingSomewhere = true;
            posToMove = Math.abs(posToMove) || 1;
            keepFollowings = keepFollowings || false;
            var _this = this,
                pos = this.currentPosition(),
                newPosition = pos > posToMove ? pos - posToMove : 0;

            _nextSequence = keepFollowings == false ? _removeRouteAfter.call(_.clone(_sequence), newPosition) : _.clone(_sequence);

            _setPosition.call(this, newPosition, this.settings.pageMoveTime+100);
            _refreshUrl.call(this, _nextSequence);
            MobiRouter.footerDep.changed();
            MobiRouter.headerDep.changed();
            this.animateScroller(false, false, false, function(){
                    Meteor.setTimeout(function(){
                        if( keepFollowings == false )
                            _sequence = _removeRouteAfter.call(_sequence, newPosition);

                        var route = _nextSequence.length ? _nextSequence[newPosition] : {};
                        _preloadRoutes.call(_this, route);

                        _goingSomewhere = false;
                    }, (keepFollowings == false ? 150 : 50));
            });
        };


        /**
         * Public clue to move right on route sequence sliders
         *
         * @param posToMove
         * @returns {boolean}
         */
        this.next = function(posToMove){
            var _this = this;
            if( _animationRunning == true || _goingSomewhere == true ){
                Meteor.setTimeout(function(){ _this.next(posToMove); }, 50);
                return false;
            }

            _goingSomewhere = true;
            posToMove = Math.abs(posToMove) || 1;
            var pos = this.currentPosition(),
                newPosition = (_routesToDisplay.call(this).length) > (pos + posToMove) ? (pos + posToMove) : pos,
                _this = this;

            _refreshUrl.call(this);
            _setPosition.call(this, newPosition);
            this.animateScroller(false, false, false, function(){
                var route = _routesToDisplay.call(this).length ? _routesToDisplay.call(this)[newPosition] : {};
                _preloadRoutes.call(_this, route);
                _goingSomewhere = false;
            });
        };


        /**
         * Public clue to move to the first slide of the sequence
         *
         * @param posToMove
         * @param keepFollowings
         * @returns {boolean}
         */
        this.first = function(keepFollowings){
            var _this = this;
            if( _animationRunning == true || _goingSomewhere == true ){
                Meteor.setTimeout(function(){ _this.first(keepFollowings); }, 50);
                return false;
            }

            _goingSomewhere = true;
            keepFollowings = keepFollowings || false;
            var _this = this;

            _nextSequence = keepFollowings == false ? _removeRouteAfter.call(_.clone(_sequence), 0) : _.clone(_sequence);

            _setPosition.call(this, 0, this.settings.pageMoveTime+50);
            _refreshUrl.call(this, _nextSequence);
            MobiRouter.headerDep.changed();
            MobiRouter.footerDep.changed();
            this.animateScroller(0, false, false, function(){
                Meteor.setTimeout(function(){
                    if( keepFollowings == false )
                        _sequence = _removeRouteAfter.call(_sequence, 0);

                    var route = _nextSequence.length ? _nextSequence[0] : {};
                    _preloadRoutes.call(_this, route);
                }, (keepFollowings == false ? 150 : 50));
            });
        };



        /**
         * Public clue to move to the last slide of the sequence
         *
         * @param posToMove
         * @returns {boolean}
         */
        this.last = function(){
            var _this = this;
            _refreshUrl.call(this);
            _setPosition.call(this, _routesToDisplay.call(this).length-1);
            this.animateScroller(_routesToDisplay.call(this).length-1, false, false, function(){
                var route = _sequence.length ? _.last(_routesToDisplay.call(this)) : {};
                _preloadRoutes.call(_this, route);
            });
        };


        /**
         * Set params of requesed/current route
         *
         * @returns {MobiRoute}
         */
        this.setParams = function(params, route){
            route = route || this.currentRoute();
            route.params = _.extend(route.params, params);

            _refreshUrl.call(this);
            MobiRouter.dep.changed();
            return route;
        };


        /**
         * Get the actual stored data
         *
         * @returns {Object}
         */
        this.getData = function(){
            var route = this.currentRoute();
            return route ? route.getData(route.getPath()) : {};
        };


        /**
         * An arra full of the current sequence's route objects
         *
         * @returns {array(MobiRoute)}
         */
        this.getSlideStack = function(){
            this.dep.depend();
            this.speak('getSlideStack()');
            return _sequence;
        };


        /**
         * Number of routes in the actual sequence
         *
         * @returns {number}
         */
        this.getSlideStackSize = function(){
            this.dep.depend();
            var size = 0;
            _.each(_sequence, function(){

            });
            return _sequence.length;
        };


        /**
         * Array of stored routes
         *
         * @returns {array}
         */
        this.storedRoutes = function(){
            this.dep.depend();
            return _.values(_routeMap);
        };


        /**
         * Throw a message with arbitrary buttons and classExtension for the whole alert and separate for each buttons
         *
         * @param options
         * @returns {boolean}
         */
        this.alert = function(options){
            if( !_.isObject(options) && !_.isString(options) ) return false;

            var btnPrototype = {
                text: 'OK',
                classExtension: '',
                action: function(){},
            };

            var _buttons = _.isObject(options) && _.isArray(options.buttons) ? options.buttons : [],
                buttons = [];
            _.each(_buttons, function(b){
                var btn = _.extend(_.clone(btnPrototype), b);
                buttons.push(btn);
            });
            buttons = buttons.length ? buttons : [btnPrototype];


            var _options = {
                message: _.isObject(options) ? (options.message || '') : options,
                buttons: buttons,
                classExtension: '',
            }

            this.alerts.push(_options);
            this.alertDep.changed();
        };


        /**
         *  Close the most top alert
         */
        this.closeAlert = function(){
            this.alerts = this.alerts.splice(0, this.alerts.length-1);
            this.alertDep.changed();
        }


        /**
         * Popup Select public function
         *
         * @param properties
         * @returns {boolean}
         */
        this.popupSelect = function(properties){
            if( !_.isObject(properties) ) return false;

            properties = _.extend({
                closeBtn: true,
                elements: {
                    value: [],
                    label: []
                },
                onSelect: function(e, option){ MobiRouter.closePopupSelect(option.id); },
                onOpen: function(e, option){ },
                onClose: function(e, option){ MobiRouter.closePopupSelect(option.id); },
                options: [],
                label: '',
                selected: '',
                classExtenstion: '',
                iScroll: { vScroll: true, vScrollbar: true}
            }, properties);

            var defOption = {
                id: properties.id,
                label: 'Option name',
                value: '1',
                selected: false
            };

            var options = {};

            _.each(properties.options, function(option, key){
                if( option.value == properties.selected ) option.selected = true;
                options[option.value] = _.extend(_.clone(defOption), option);
            });

            properties.options = options;

            this.popupSelects[properties.id] = properties;
            this.popupSelectsDep.changed();
            Deps.afterFlush(function(){
                properties.onOpen();
            });
        };

        /**
         *  Close the most top popup select
         */
        this.closePopupSelect = function(id){
            id = id || "last";
            var popup = false;
            var key = this.popupSelects.length-1;
            if( id == "last"){
                var id = _.last(_.keys(this.popupSelects));
                popup = this.popupSelects.id;
            }else{
                popup = _.find(this.popupSelects, function(p, k){
                    if( p.id == id ) key = k;
                    return p.id == id;
                });
            }
            if( !popup ) return false;

            this.popupSelects[id].iScrollObject.destroy();
            delete this.popupSelects[id];

            this.popupSelectsDep.changed();
        };

        this.popupOptionSelected = function(e, option){
            console.log(option);
            var popup = this.popupSelects[option.id];
            if( !popup || !popup.options[option.value] ) return;

            popup.onSelect(e, option);

            /*_.each(popup.elements.value, function(e, i){
                $(popup.elements.value[i]).val(option.value);
            });

            _.each(popup.elements.label, function(e, i){
                $(popup.elements.label[i]).val(option.label);
            });

            _.each(popup.options, function(o, i){
                popup.options[i].selected = Boolean(o.value == option.value);
            });*/
            this.popupSelectsDep.changed();
        };

        /**
         * Initialize the iscroll for the popup select
         *
         * @param wrapper
         * @param options
         */
        this.addPopupIScroll = function(id, options){
            this.popupSelects[id].iScrollObject = newScroll('popup-select-'+id, options);
        };

        // Testing functions
        this.getMap = function(){ return _routeMap; };

        return this;
    };

    MobiRouter = new MRouter;

    Function.prototype.duplicate = function() {
        var that = this;
        var temp = function temporary() { return that.apply(this, arguments); };
        for( key in this ) {
            temp[key] = this[key];
        }
        return temp;
    };

    $(document).ready(function(){
        function createFragment(htmlStr) {
            var frag = document.createDocumentFragment(),
                temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            return frag;
        }

        if( isMobile || (MobiRouter && MobiRouter.showFullScreen) ){
            var fragment = createFragment('<div class="mobi_full_black_background"></div>');
            document.body.insertBefore(fragment, document.body.childNodes[0]);
            setTimeout(function(){  }, 1500);
        }
    });

})(jQuery);
