(function(Handlebars){

    Handlebars.registerHelper('MobiRouter', function(){
        return MobiRouter;
    });

    Handlebars.registerHelper('pageTitle', function(){
        MobiRouter.dep.depend();
        return MobiRouter.getPageTitle();
    });

    Handlebars.registerHelper('MobiLoading', function(){
        MobiRouter.dep.depend();
        return MobiRouter.loading();
    });

    Handlebars.registerHelper('currentTemplate', function(){
        return MobiRouter.currentTemplate();
    });


    /**
     * Allocates the innerWidth of an element for it's child elements
     *
     * @param parent
     * @returns {boolean}
     */
    allocateHorizontalSpace = function(parent){
        if( !parent ) return false;

        var parentComputed = window.getComputedStyle(parent);
        if( !parentComputed ) return false;

        var parentInnerSize = parseFloat(parentComputed.width, 10);


        var children = parent.querySelectorAll('.mobi_alert_button');
        children = children.length ? children : [];

        var childrenBorderSizes = 0;
        _.each(children, function(child){
            var computed = window.getComputedStyle(child);
            childrenBorderSizes += computed ?
                parseFloat(computed.marginLeft, 10) +
                    parseFloat(computed.marginRight, 10) +
                    parseFloat(computed.paddingLeft, 10) +
                    parseFloat(computed.paddingRight, 10) +
                    parseFloat(computed.borderLeft, 10) +
                    parseFloat(computed.borderRight, 10)
                : 0;

        });

        var childNum = children.length || 1,
            childWidth = (parentInnerSize - childrenBorderSizes)/childNum;
        _.each(children, function(child){
            child.style.width = childWidth+'px';
        });

    }

})(Handlebars);