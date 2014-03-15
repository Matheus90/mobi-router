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
            desktopWidth: 840,
            desktopHeight: 480,
            headerHeight: 45,
            sidebarToggleBtn: 45,
            sidebar: true,
            sidebarDefaultWidth: 200,
            defaultBackBtnText: 'Back',
            defaultBackBtnAction: function(){ MobiRouter.back(); },
            defaultNextBtnText: 'Next',
            defaultNextBtnAction: function(){ MobiRouter.next(); },
        };
        this.settings = {};

        // Storing sizes of page elements
        this.sizes = {
            router: {width: 0, height: 0},
            sidebar: {width: 0, height: 0},
            main: {width: 0, height: 0},
            header: {width: 0, height: 0},
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

        // I scroll handler for sidebar
        var _sidebarIScroll;

        // This is the original storage of routes
        var _routeMap = {};

        // Storage of prev/actual/next paths
        var _routes = {};

        // Storage of page sequences, each sequence works like a separate slider.
        // It's an opportunity to create sign up sequences or sth. else that can be passed from left to right trough slides
        //var _sequences = {};

        var _sequence = [];
        var _position = 0;

        // It's a sequence full of moving values for the animateScroller() function
        //var _animationSequence = [];

        this.dep = new Deps.Dependency;

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

            Meteor.startup(function(){
                _startNewSequence.call(_this, false, _getSequenceFromUrl.call(_this));
                MobiRouter.animateScroller(false, 0);
            });
        };


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

            var r = _findByUrl();
            route = _routeMap[r.name];
            return route || false;
        };


        /**
         * Returns the MobiRoute object of the given route name
         *
         * @param name
         * @returns {MobiRoute|false}
         * @private
         */
        function _getRouteObj(name){
            name = name ? name : Session.get('actual_page');
            var route = _routeMap[name];
            return route ? route : false;
        };


        /**
         * Find the current route from the url
         *
         * @returns {MobiRoute|false}
         * @private
         */
        function _findByUrl(){
            var routePoints = [];

            _.each(_routeMap, function(r){
                var obj = {name: r.name, point: r.checkUrlMatch()};
                routePoints.push(obj);
            });

            routePoints = _.reject(routePoints, function(rp){ return rp.point === false });
            return routePoints.length ? _.max(routePoints, function(rp){ return rp.point}) : false;
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
        function _getSequenceFromUrl(url){
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
                    var r = jQuery.extend(true, {}, route);
                    if( pathname == '' || isRoute == true || (r.cleanPath == '/' &&  pos > 0) ) return false;
                    if( pathname.indexOf(r.cleanPath) == 0 ){
                        r.position = routes.length;
                        routes.push(r);
                        isRoute = true;
                    }
                });

                if( isRoute == true ){
                    paramPos = 0;
                    absPos += _.compact((routes[routes.length-1].cleanPath).split('/')).length;
                    cutOff = routes[routes.length-1].cleanPath;
                }else if(routes.length){
                    var r = routes[routes.length-1],
                        paramName = r.urlParams[paramPos];
                    if( r.urlParams[paramPos] || param == '' ){
                        paramPos += 1;
                        absPos += 1;
                        cutOff = ('/'+loc[absPos]);
                        if( paramName ) routes[routes.length-1].params[paramName] = loc[absPos];
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

            return routes;
        }

        /**
         * Centralized way to set position in the sequence
         *
         * @param pos
         * @private
         */
        function _setPosition(pos){
            this.speak('set position to "'+pos+'"');
            _position = pos;
            this.dep.changed();
        };


        /**
         * Calculating the url from the actual sequence
         *
         * @returns {string}
         * @private
         */
        function _calculateUrl(){
            var url = '';
            _.each(_sequence, function(route, key){
                var path = route.getPath();
                url += path != '/' ? path : '';
            });

            return String(url ? url : '/');
        };


        /**
         * Refreshing the address line of the browser
         *
         * @private
         */
        function _refreshUrl(){
            this.speak('refreshing url');
            var url = _calculateUrl.call(this);
            window.history.pushState({}, 'Mobi-Router Demo Site', url);
        };


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
            this.settings = _settings;

            this.speak('configuration saved');

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
            }

            return Boolean(_loading);
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
            var settings = this.settings,
                width = window.innerWidth,
                height = window.innerHeight;
            this.showFullScreen = isMobile || Boolean(settings.desktopWidth > width || settings.desktopHeight > height);

            this.sizes.router.width = isMobile || this.showFullScreen ? width : settings.desktopWidth;
            this.sizes.sidebar.width = settings.sidebarDefaultWidth > (width - this.settings.sidebarToggleBtn) ? (width - settings.sidebarToggleBtn) : settings.sidebarDefaultWidth;

            if( isMobile ) this.sizes.router.height = this.sizes.sidebar.height = this.sizes.main.height = height;
            else this.sizes.router.height = this.sizes.main.height = this.sizes.sidebar.height = this.showFullScreen ? height : settings.desktopHeight;

            this.sizes.main.width = this.sizes.router.width;

            this.sizes.header.height = settings.headerHeight;
            this.sizes.header.width = this.sizes.main.width;
            this.sizes.content.width = this.sizes.main.width;
            this.sizes.content.height = this.sizes.main.height - this.sizes.header.height;

            return this.sizes;
        };


        /**
         *  Refresh sidebar iScroll if exists and create it if not
         */
        this.refreshSidebarScroll = function(){
            var _this = this;
            if( _sidebarIScroll ) _sidebarIScroll.refresh();
            else if( document.getElementById('mobi_sidebar') ) Meteor.setTimeout(function(){ _sidebarIScroll = newScroll('mobi_sidebar', {vScroll: true})}, 100);
            else Meteor.setTimeout(function(){ _this.refreshSidebarScroll(); }, 50);
        };


        /**
         *  Initializing and/or Refreshing iScrolls of the sidebar and the pages
         */
        this.initScrolls = function(){
            this.speak('initializing/refreshing iScrolls');

            this.refreshSidebarScroll();
            Meteor.setTimeout(refreshIscrolls, 300);
        };


        /**
         * It's the common function to display another page.
         *
         * @param routeName
         * @param params
         * @param pushToStack
         */
        this.go = function(routeName, params, pushToStack){
            pushToStack = pushToStack || false;
            var r = _getRoute(routeName);
            if( !r ) return console.log('Error: This route does not exists.');

            var route = _.clone(r);
            // Fill the parameters of route
            if( params !== true && _.isObject(params) )
                route.params = params;
            else if( params == 'url' )
                route.params = route.getUrlParameters();
            else
                route.params = {};

            // Start new sequence of push to the existing one
            if( pushToStack === true || params === true )
                _addToSequence.call(this, route);
            else
                _startNewSequence.call(this, route);

        };


        function _startNewSequence(route, sequence){
            this.speak('start new sequence ');

            if( sequence ){
                _sequence = sequence;
                this.calculateSizes();
                this.animateScroller(false, 10);
            }else{
                route.position = 0;
                _sequence = [route];
            }

            // Set actual sidebar item to active (by it's class)
            _setMenuItemActive.call(this);

            _refreshUrl.call(this);
            _setPosition.call(this, _sequence.length-1);
        };


        function _addToSequence(route, data){
            this.speak('adding route DYNAMICALLY TO sequence');

            var slide = this.currentPosition();

            route.position = slide+1;
            _sequence[slide+1] = route;
            _sequence = _sequence.splice(0, slide+2);

            // Set actual sidebar item to active (by it's class)
            if( _sequence.length == 1) _setMenuItemActive.call(this);

            _refreshUrl.call(this);
            _setPosition.call(this, _sequence.length-1);
        };


        function _removeRouteAfter(pos){
            var route = _sequence[pos] || {};
            this.speak('remove route(s) after "'+(route.name || '<undefined route>')+'" from sequence');

            _sequence = _sequence.splice(0, pos+1);
        };



        /**
         * Animates the slider of the sequence to move the next position
         */
        this.animateScroller = function(pos, time){
            pos = _.isNumber(pos) ? pos : this.currentPosition();

            var move = -(pos * this.sizes.content.width),
                time = _.isNumber(time) ? time : (this.settings.scrollTime ? this.settings.scrollTime : 750);

            this.speak('animating pages slider: to '+move+'px in '+time+' msec');
            if(_.isNumber(move) && _.isNumber(time) && document.getElementById('sequence_scroller') ) $('#sequence_scroller').hardwareAnimate({translateX: move}, time, 'easeOutExpo');
            else console.log('Error: move ('+move+') or time ('+time+') is not a number.');
        };


        /**
         * Animates the slider of the sequence to move the next position
         */
        this.jumptToPosition = function(pos){
            pos = _.isNumber(pos) ? pos : this.currentPosition();

            var move = -(pos * this.sizes.content.width);

            this.speak('moving pages slider to x='+move+'px');
            if(_.isNumber(move) && document.getElementById('sequence_scroller') ) $('#sequence_scroller').hardwareCss({translateX: move, translateY: 0, translateZ: 0});
            else console.log('Error: move ('+move+') is not a number');
        };


        /**
         * Rendering actual content by session "actual_page"
         *
         * @returns {html}
         */
        this.content = function(route){
            MobiRouter.dep.depend();
            var route = route || this.currentRoute();
            var viewTemplate = 'mobi_page_not_found';

            if( !route )
                viewTemplate = this.notFoundTemplate();
            else if( route.routeType != undefined && route.routeType != 'SimplePage' ){
                viewTemplate = _customViews[route.routeType];
                if( viewTemplate )
                    return Template[viewTemplate];
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
            return _sequence[this.currentPosition()];
        };


        /**
         * Provide current route's position in the sequence
         *
         * @returns {number}
         */
        this.currentPosition = function(){
            MobiRouter.dep.depend();
            return _position;
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

            $('#mobi_main').hardwareAnimate({translateX: '+='+(this.sizes.sidebar.width - 5)}, 300, 'easeOutExpo', function(){}, function(){
                refreshIscrolls();
                _this.mainTranslateX += _this.sizes.sidebar.width;
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

            $('#mobi_main').hardwareAnimate({translateX: '+='+(-this.sizes.sidebar.width + 5)}, 300, 'easeOutExpo', function(){}, function(){
                refreshIscrolls();
                _this.mainTranslateX += -_this.sizes.sidebar.width;
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
            var data = this.currentRoute() ? this.currentRoute().buttons : {};

            return data.showBackButton != undefined ? Boolean(data.showBackButton) : Boolean( this.currentPosition() > 0 );
        };


        /**
         * Returns a boolean value of whether the "Done" button of the sequences should be shown
         *
         * @returns {boolean}
         */
        this.hasNextBtn = function(){
            MobiRouter.dep.depend();
            var data = this.currentRoute() ? this.currentRoute().buttons : {};

            return data.showNextButton != undefined ? Boolean(data.showNextButton) : Boolean( this.currentPosition() < _sequence.length-1 );
        };


        /**
         * Developer can change the text of "Back" button by setting the "backBtnText" parameter of the page
         *
         * @returns {string|"Back"}
         */
        this.backBtnText = function(){
            MobiRouter.dep.depend();
            var data = this.currentRoute() ? this.currentRoute().buttons : {};

            return data.backBtnText ? String(data.backBtnText) : String(this.settings.defaultBackBtnText);
        };


        /**
         * Developer can change the text of "Done" button by setting the "doneBtnText" parameter of the page
         *
         * @returns {string|"Done"}
         */
        this.nextBtnText = function(){
            MobiRouter.dep.depend();
            var data = this.currentRoute() ? this.currentRoute().buttons : {};

            return data.nextBtnText ? String(data.nextBtnText) : String(this.settings.defaultNextBtnText);
        };

        /**
         *
         *
         * @param e
         * @returns {*}
         */
        this.backBtnAction = function(e){
            MobiRouter.dep.depend();
            var data = this.currentRoute() ? this.currentRoute().buttons : {};

            return _.isFunction(data.backBtnAction) ? data.backBtnAction(e) : this.settings.defaultBackBtnAction(e);
        };


        this.nextBtnAction = function(e){
            MobiRouter.dep.depend();
            var data = this.currentRoute() ? this.currentRoute().buttons : {};

            return _.isFunction(data.nextBtnAction) ? data.nextBtnAction(e) : this.settings.defaultNextBtnAction(e);
        };


        /**
         * Public clue to move left on route sequence sliders
         *
         * @param posToMove
         * @param keepFollowings
         * @returns {boolean}
         */
        this.back = function(posToMove, keepFollowings){
            posToMove = Math.abs(posToMove) || 1;
            keepFollowings = keepFollowings || false;
            var _this = this,
                pos = this.currentPosition(),
                newPosition = pos > posToMove ? pos - posToMove : 0;

            if( keepFollowings == false ) _removeRouteAfter.call(this, newPosition);
            _refreshUrl.call(this);
            _setPosition.call(this, newPosition);
            this.animateScroller();
        };


        /**
         * Public clue to move right on route sequence sliders
         *
         * @param posToMove
         * @returns {boolean}
         */
        this.next = function(posToMove){
            posToMove = Math.abs(posToMove) || 1;
            var pos = this.currentPosition(),
            newPosition = (this.getSlideStackSize()) > (pos + posToMove) ? (pos + posToMove) : 0;

            _refreshUrl.call(this);
            _setPosition.call(this, newPosition);
            this.animateScroller();
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

})(jQuery);