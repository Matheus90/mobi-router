(function() {
    MobiRoute = function(name, params){

        var _defaultParams = {
            name: '',
            path: '',
            cleanPath: '',
            urlParams: [],
            template: '',
            data: {},
            params: {},
            buttons: {},
            scrollable: true, //'depends-on-size' // true || false || 'depends-on-size'
        };

        _.extend(_defaultParams, params);
        _defaultParams.name = name;
        _.extend(this, _defaultParams);
        _clearPath.call(this);


        /**
         * Separates the "path" attribute to core path called "cleanPath" and parameters called "urlParams"
         *
         * @private
         */
        function _clearPath(){
            var pathArr = this.path.split('/');
            var cPath = '';
            var uParams = [];
            _.each(pathArr, function(p){
                if( p.match(/:\w+/) )
                    uParams.push(p.replace(':', ''));
                else
                    cPath += p ? '/'+p : '';
            });
            this.cleanPath = cPath ? cPath : '/';
            this.urlParams = uParams;
        };


        /**
         * Returns the url of requested slide with the given parameters
         *
         * @param params
         * @returns {string}
         */
        this.getPath = function(params){
            params = params ? params : this.params;
            var pathArr = this.path.split('/');
            var newPath = '';
            _.each(pathArr, function(param, key){
                if( param.indexOf(':') == 0 ){
                    param = param.replace(':', '');
                    newPath +=  (params[param] != undefined ? '/' + (_.isFunction(params[param]) ? params[param]() : params[param]) : '/undefined');
                }else
                    newPath += param == '' ? '' : ('/'+param);
            });

            while( newPath.match(/\/undefined$/) || newPath.match(/\/undefined\/$/) ){
                newPath = newPath.replace(/\/undefined\/$/, '');
                newPath = newPath.replace(/\/undefined$/, '');
            };

            return newPath;
        };


        /**
         *  Rendering content of the route
         *
         * @returns {html}
         */
        this.content = function(){
            return Template[this.template];
        };


        /**
         * Reading parameters from the url
         *
         * @param preParams
         * @returns {{}}
         * @private
         */
        function _readParams(url){
            var pathArr = this.path.split('/');
            var location = url ? url.split('/') : [];
            var params = {};
            _.each(pathArr, function(param, key){
                if( param.indexOf(':') == 0 ){
                    params[param.replace(':', '')] = location[key] == 'undefined' ? undefined : location[key];
                }
            });

			console.log('PARAMS', url, this.path);
            return params;
        };


        /**
         * Run "data" attribute with parameters from the url if it's a function or return it as simple object
         *
         * @returns {object}
         */
        this.getData = function(url){
            if( _.isFunction(this.data) ){
                this.params = _readParams.call(this, url);
                return _.extend({}, this.data());
            }else
                return this.data || {};
        };


        /**
         * Return the pameters from the url
         *
         * @returns {object}
         */
        this.getUrlParameters = function(){
            return this.params = _readParams.call(this);
        };


		this.setParams = function(url) {
			return this.params = _readParams.call(this, url);
		};
		
		this.setParamsFromCurrentRoute = function(currentRoute) {
			this.params = this.params || {};
			
			//this is pretty dumb for now; it only allows previous routes to have the same params as the current route
			_.each(this.urlParams, function(previousRouteParam) {
				_.each(currentRoute.urlParams, function(currentRouteParam) {
					if(previousRouteParam == currentRouteParam) //this wont work well for linking between objects of the same type
						this.params[currentRouteParam] = currentRoute.params[currentRouteParam];
				}.bind(this));
			}.bind(this));
			//in the future we need to be able to specify previous route names like this: order/:customer_id
			//we'll need to use the actual mongo object field name (i.e. customer_id) so we can for example grab that 
			//off the current Order object, i.e. order.customer_id
			
			return this.params;
		};
		
        /**
         * A little pointing function, used for find the actual route by the url
         *
         * @returns {number}
         */
        this.getRouteMatchScore = function(url){
            var path = this.cleanPath,
                pathname = url || window.location.pathname,
                pathArr = path.split('/'),
                locArr = pathname.split('/');

            if( location == path ) return 9999;

            var i = 0,
                c = -1.0;
            _.each(locArr, function(l){
                if(l == pathArr[i]) c += 1.0;
                i++;
            });
            if(i > c) { //if there is at least one legitmate param. 	
				_.each(this.urlParams, function(param){ 			
					c += param ? 0.01 : 0;
				 });
			}
                
				
			return c || -1;
            //return c > -1 ? c : false;
        };

        return this;
    };
})();
