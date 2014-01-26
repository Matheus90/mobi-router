(function(){
    MobiSequence = function(name, params){

        var _defaultParams = {
            name: '',
            routes: [],
            stackSize: 0
        };

        // For inner functions
        var _this = this;

        // Storing data for each slide for reuse on step-back
        this.storedData = {};


        /**
         * Store data for the slide for be able to reuse it when clicking/triggering slide-back
         *
         * @param slide
         * @param data
         */
        this.storeData = function(slide, data){
            var data = data ? data : {};
            this.storedData['s'+slide] = data;
        };

        _.extend(_defaultParams, params);
        _defaultParams.name = name;
        _.extend(this, _defaultParams);
        this.stackSize = this.routes.length;


        /**
         *  Loop throught each routes to create a default empty object as stored data
         */
        _.each(this.routes, function(r, key){
            _this.storeData(key+1, {});
        });


        /**
         * Returns the url of requested slide with the given parameters
         *
         * @param params
         * @returns {string}
         */
        this.getPath = function(slide, params){
            if( !this.routes[slide-1] ) return '';
            params = params ? params : {};
            var newPath = '/'+this.name+'/'+slide;

            _.each(this.routes[slide-1].urlParams, function(p){
                newPath +=  (params[p] != undefined ? '/' + (_.isFunction(params[p]) ? params[p]() : params[p]) : '');
            });
            newPath = newPath.replace(/((\/\/).*)/, '/undefined/').replace(/undefined$/, '');

            return newPath;
        };


        /**
         * Provide the actual route within the sequence
         *
         * @returns {MobiRoute|false}
         */
        this.actualRoute = function(){
            var route = this.routes[this.getSlideFromUrl()-1];
            return route ? route : false;
        };


        /**
         * Reading parameters from the url
         *
         * @param preParams
         * @returns {object}
         * @private
         */
        function _readParams(route){
            var pathArr = route.urlParams,
                location = window.location.pathname.split('/'),
                params = {};

            _.each(pathArr, function(param, key){
                params[param] = location[key+3];
            });
            return params;
        };


        /**
         * Provide the actual slide's number in the sequence
         *
         * @returns {number}
         */
        this.currentSlide = function(){
            var slideNow = Session.get('actual_slide');
            return slideNow ? slideNow : 1;
        };


        /**
         * Provide the actual slide's number from the url
         *
         * @returns {number}
         */
        this.getSlideFromUrl = function(){
            var location = window.location.pathname.split('/');
            return location[2] ? parseInt(location[2], 10) : 1;
        };


        /**
         * Provide data object for the given slide within the actual sequence
         *
         * @param slide
         * @returns {object}
         */
        this.getData = function(slide){
            var route = slide ? this.routes[slide-1] : this.actualRoute();
            return _readParams.call(this, route);
        };


        /**
         * Provide data object for the given slide within the actual sequence from the url
         *
         * @param slide
         * @returns {object}
         */
        this.getDataFromUrl = function(slide){
            var route = slide ? this.routes[slide-1] : this.actualRoute();
            if( _.isFunction(route.data) ){
                route.params = _readParams.call(this, route);
                return route.data();
            }else
                return route.data;
        };


        /**
         * It's used for creating a list of sequences' points from the url to decide which one is the actual
         *
         * @returns {number}
         */
        this.checkUrlMatch = function(){
            var path = this.path,
                location = window.location,
                pathArr = path.split('/'),
                locArr = location.pathname.split('/');

            var i = 0,
                c = -1;
            _.each(locArr, function(l){
                if( l == pathArr[i] )
                    c++;
                i++;
            });

            return c > -1 ? c : false;
        };

        return this;
    };
})();