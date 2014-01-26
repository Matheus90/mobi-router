(function($) {
    MRouter = function(){

        // Centralized speaking funtion for Mobi-Router
        this.speak = function(message){
            if( this.settings && !this.settings.canISpeak ) return false;
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
            sidebarAutoOpenDesktop: true,
            sidebarDefaultWidth: 200,
            sidebarTemplate: 'sidebar',
            defaultBackBtnText: 'Back',
            defaultDoneBtnText: 'Done',
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

        // I scroll handler for sidebar
        var _sidebarIScroll;

        // This is the original storage of routes
        var _routeMap = {};

        // Storage of prev/actual/next paths
        var _routes = {};

        // Storage of page sequences, each sequence works like a separate slider.
        // It's an opportunity to create sign up sequences or sth. else that can be passed from left to right trough slides
        var _sequences = {};

        // The sequence currently in use
        var _currentSequence = false;

        // It's a sequence full of moving values for the animateScroller() function
        var _animationSequence = [];

        // The currently used route
        var _currentRoute = false;


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

            var sequence = _findSequenceByUrl();
            if( !sequence ) this.go();
            mobiResizeable.init(true);
            if( sequence ) this.openSequence(sequence.name, 'url');
        };


        /**
         * Check if the route exists, return the route if it does and return false if not
         *
         * @param name
         * @returns {MobiRoute|false}
         * @private
         */
        function _getRoute(name){
            name = name ? name : Session.get('actual_page');
            var route = _routeMap[name];
            _currentRoute = route ? route : false;
            if( _currentRoute )
                return _currentRoute;

            var r = _findByUrl();
            route = _routeMap[r.name];
            return _currentRoute = route ? route : false;
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
         * Search for current/requested sequence
         *
         * @param name
         * @returns {MobiSequence|false}
         * @private
         */
        function _getSequence(name){
            name = name == undefined ? Session.get('actual_page') : name;
            var sequence = _sequences[name];
            _currentSequence = sequence ? sequence : false;
            if( _currentSequence )
                return _currentSequence;

            _currentSequence = _findSequenceByUrl();
            return _currentSequence;
        };


        /**
         * Find the current sequence from the url
         *
         * @returns {boolean}
         * @private
         */
        function _findSequenceByUrl(){
            var sequence = false;
            var location = window.location,
                locArr = location.pathname.split('/');

            _.each(_sequences, function(s){
                if( sequence ) return true;

                sequence = locArr[1] && locArr[1] == s.name ? s : false;
            });

            return sequence;
        };


        /**
         * Set the actually opened page's menu item to active
         *
         * @param name
         * @returns {*}
         * @private
         */
        function _setMenuItemActive(name){
            if( !name || name == undefined ) return name;

            _.each(document.getElementsByClassName('active_sidebar_item'), function(item){
                item.className = item.className.replace(' active_sidebar_item', '');
            });
            _.each(document.getElementsByClassName('menu_item_'+name), function(item){
                item.className += ' active_sidebar_item';
            });

            return name;
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
         * Adds new sequence to the storage if didn't yet
         *
         * @param name
         * @param routes
         * @returns {boolean}
         */
        this.addSequence = function(name, routes){
            if( _sequences[name] != undefined ) return false;
            this.speak('adding route sequence');

            // Create new sequence
            _sequences[name] = new MobiSequence(name, {
                name: name,
                routes: _.compact(_.map(routes, function(r){
                    var route = _.clone(_getRouteObj(r.name));
                    if( r.data != undefined )
                        route.data = r.data;
                    // Check if it's an existing route or not
                    return route ? route : false;
                }))
            });

            if( !_sequences[name].routes.length ) delete _sequences[name];
        };


        /**
         *  Calculates the size of each part of the Mobi-Router layout to fit on the screen
         *
         * @param width
         * @param height
         */
        this.calculateSizes = function(width, height){
            var settings = this.settings;
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
            if( _sidebarIScroll ) _sidebarIScroll.refresh();
            else Meteor.setTimeout(function(){
                _sidebarIScroll = new iScroll('mobi_sidebar', {hScroll: false, hScrollbar: false, vScroll: true, vScrollbar:false});
            }, 100);
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
         */
        this.go = function(routeName, params){
            _currentSequence = false;
            var route = _getRoute(routeName);
            if( !route ){
                Session.set('actual_slide', 1);
                Session.set('actual_data', {});
                Session.set('actual_page', 'mobi_router_page_not_found');
                return console.log('Mobi-Router: This route does not exists.');
            }

            _setMenuItemActive(routeName);

            window.history.pushState("", "MobiRouter", route.getPath(params));

            Session.set('actual_slide', 1);
            Session.set('actual_data', route.getData());
            Session.set('actual_page', route.name);
        };


        /**
         * Rendering actual content by session "actual_page"
         *
         * @returns {html}
         */
        this.content = function(){
            var routeName = Session.get('actual_page'),
                data = Session.get('actual_data'),
                route = _getRoute(routeName);
            if( !route ) return this.settings.notFoundTemplate ? Template[this.settings.notFoundTemplate]() : Template.mobi_not_found.call();

            Meteor.setTimeout(function(){ mobiResizeable.resizeAllElements(); }, 100);

            return Template[route.template](data);
        };


        /**
         * Opening a sequence, moves to the requested page
         *
         * @param name
         * @param slide
         * @param data
         * @returns {boolean}
         */
        this.openSequence = function(name, slide, data){
            _currentRoute = false;
            if( _sequences[name] == undefined ) return false;

            _currentSequence = _sequences[name];
            var fromUrl = slide == 'url',
                slideNow =  fromUrl ? 1 : _currentSequence.currentSlide(),
                slide = fromUrl ? _currentSequence.getSlideFromUrl() : parseInt(slide);

            if( slide > _currentSequence.stackSize || slide < 1) return false;

            data = !fromUrl && !data ? _currentSequence.storedData['s'+slide] : (data ? data : _currentSequence.getData(slide));
            _currentSequence.storeData(slide, data);
            window.history.pushState("", "MobiRouter", _currentSequence.getPath(slide, data));

            Session.set('actual_page', name);
            Session.set('actual_slide', slide);
            Session.set('actual_data', _currentSequence.getDataFromUrl(slide));

            _setMenuItemActive.call(this, name);

            var move = (slideNow - slide) * this.sizes.content.width;
            _animationSequence.push(move);
            if( document.getElementById('sequence_scroller') )
                this.animateScroller();
        };


        /**
         * Animates the slider of the sequence to move the next position
         */
        this.animateScroller = function(){
            if( !this.isSequence() || _animationSequence.length == 0 ) return;
            var move = _animationSequence.shift();
            if(_.isNumber(move) ) $('#sequence_scroller').hardwareAnimate({translateX: move}, 500, 'easeOutExpo');
        };


        /**
         * Animates the sequence to the given slide with provided data
         *
         * @param slide
         * @param data
         * @returns {boolean}
         */
        this.slideTo = function(slide, data){
            if( !_currentSequence ) return false;

            if( slide == undefined || slide > this.getSlideStackSize() || slide < 1 ) return;
            return this.openSequence(_currentSequence.name, slide, data);
        };


        /**
         * Simple check for being in a route sequence or not
         *
         * @returns {boolean}
         */
        this.isSequence = function(){
            var refresh = Session.get('actual_page');
            return Boolean(_getSequence());
        };


        /**
         * Provide the current route
         *
         * @returns {MobiRoute|object}
         */
        this.currentRoute = function(){
            return _currentRoute ? _currentRoute : {};
        }; //-> this should return the object i made above, e.g: "{id: 'home', path: etc}


        /**
         * Provide the current sequence
         *
         * @returns {boolean}
         */
        this.currentSequence = function(){
            return _currentSequence;
        };


        /**
         * Provide current slide's MobiRoute object or false on failure
         *
         * @returns {MobiRoute|false}
         */
        this.currentSlide = function(){
            return this.isSequence() ? _currentSequence.actualRoute() : false;
        };


        /**
         * Provide current slide's position in the sequence
         *
         * @returns {number}
         */
        this.currentSlideNum = function(){
            return this.isSequence() ? _currentSequence.currentSlide() : 1;
        };


        /**
         * Current route's name
         *
         * @returns {string}
         */
        this.currentRouteName = function(){
            return this.isSequence() ? String(this.currentSlide().name) : String(this.currentRoute().name);
        };


        /**
         * Current route's template name
         *
         * @returns {string}
         */
        this.currentTemplate = function(){
            return this.isSequence() ? String(this.currentSlide().template) : String(this.currentRoute().template);
        };


        /**
         * Renders the provided sidebar template into the position
         *
         * @returns {*}
         */
        this.sidebar = function(){
            return Template[_settings.sidebarTemplate]();
        };


        /**
         * Opens the sidebar by moving the content right
         *
         * @returns {true}
         */
        this.showSidebar = function(){
            if(this.sidebarShown) return;
            this.speak('show sidebar');
            var _this = this;

            $('#mobi_main').hardwareAnimate({translateX: this.sizes.sidebar.width - 5}, 300, 'easeOutExpo', function(){}, function(){
                refreshIscrolls();
                _this.mainTranslateX += _this.sizes.sidebar.width;
            });
            this.sidebarShown = true;

            return true;
        };


        /**
         * Closes the sidebar by moving the content back to the left
         *
         * @returns {true}
         */
        this.hideSidebar = function(){
            if(!this.sidebarShown) return;
            this.speak('hide sidebar');
            var _this = this;

            $('#mobi_main').hardwareAnimate({translateX: -this.sizes.sidebar.width + 5}, 300, 'easeOutExpo', function(){}, function(){
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
        this.getPageTitle = function(){
            var name = Session.get('actual_page'),
                sequence = _getSequence(),
                route = !sequence || sequence == undefined ? _currentRoute : sequence.actualRoute(),
                data = Session.get('actual_data'),
                slide = Session.get('actual_slide');

            if( !route ) return this.settings.notFoundTitle ? this.settings.notFoundTitle : 'Page not found';

            var title = data && data.title ? data.title : route.defaultTitle;
            title = title ? title : '';

            _.each(title.match(/\{:(\w+)\}/g), function(param){
                var key = param.replace('{:', '').replace('}', '');
                title = title.replace('{:'+key+'}', String(data && data[key] ? data[key] : ''));
            });

            return String(title);
        };


        /**
         * Returns a boolean value of whether the "Back" button of the sequences should be shown
         *
         * @returns {boolean}
         */
        this.hasBackBtn = function(){
            var data = Session.get('actual_data');
            if( data && data.showBackButton == false ) return false;
            return this.isSequence() && ( this.currentSlideNum() > 1 || (data && data.showBackButton == true) );
        };


        /**
         * Returns a boolean value of whether the "Done" button of the sequences should be shown
         *
         * @returns {boolean}
         */
        this.hasDoneBtn = function(){
            var data = Session.get('actual_data');
            if( data && data.showDoneButton === false ) return false;
            return this.isSequence() && ( this.currentSlideNum() < this.getSlideStackSize() || (data && data.showDoneButton == true) );
        };


        /**
         * Developer can change the text of "Back" button by setting the "backBtnText" parameter of the page
         *
         * @returns {string|"Back"}
         */
        this.backBtn = function(){
            var data = Session.get('actual_data');
            return data && data.backBtnText ? String(data.backBtnText) : String(this.settings.defaultBackBtnText);
        };


        /**
         * Developer can change the text of "Done" button by setting the "doneBtnText" parameter of the page
         *
         * @returns {string|"Done"}
         */
        this.doneBtn = function(){
            var data = Session.get('actual_data');
            return data && data.doneBtnText ? String(data.doneBtnText) : String(this.settings.defaultDoneBtnText);
        };


        /**
         * Public clue to move left on route sequence sliders
         *
         * @param stepsToMove
         * @returns {boolean}
         */
        this.prev = function(stepsToMove){
            if( !_currentSequence ) return false;
            stepsToMove = stepsToMove ? Math.abs(stepsToMove) : 1;

            var slideNow = _currentSequence.currentSlide(),
                slide = slideNow - stepsToMove;

            return this.openSequence(_currentSequence.name, slide);
        };


        /**
         * Public clue to move right on route sequence sliders
         *
         * @param stepsToMove
         * @returns {boolean}
         */
        this.next = function(stepsToMove){
            if( !_currentSequence ) return false;
            stepsToMove = stepsToMove ? Math.abs(stepsToMove) : 1;

            var slideNow = _currentSequence.currentSlide(),
                slide = slideNow + stepsToMove;

            this.openSequence(_currentSequence.name, slide);
        };


        /**
         * Get the actual stored data
         *
         * @returns {Object}
         */
        this.getData = function(){
            var route = this.currentRoute();
            return route ? route.getData() : {};
        }; //->u will notice i have a bunch of global functions like this: http://snapplr.com/xj4k which get a model based on a session-stored id. We need a consistent API for this.


        /**
         * An arra full of the current sequence's route objects
         *
         * @returns {array(MobiRoute)}
         */
        this.getSlideStack = function(){
            var currentSequence = _getSequence();
            if( !currentSequence ) return [];
            else return currentSequence.routes;
        };


        /**
         * Number of routes in the actual sequence
         *
         * @returns {number}
         */
        this.getSlideStackSize = function(){
            var currentSequence = _getSequence();
            if( !currentSequence ) return 0;
            else return currentSequence.routes.length;
        };


        // Testing functions
        this.getMap = function(){ return _routeMap; };
        this.getSequences = function(){ return _sequences; };

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
        Meteor.setTimeout(function(){
            mobiResizeable.resizeAllElements();
            MobiRouter.initScrolls();
        }, 100);
    });
})(jQuery);