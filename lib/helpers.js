(function(Handlebars){

    Handlebars.registerHelper('MobiRouter', function(){
        return MobiRouter;
    });

    Handlebars.registerHelper('pageTitle', function(){
        MobiRouter.dep.depend();
        return MobiRouter.getPageTitle();
    });

    Handlebars.registerHelper('currentTemplate', function(){
        return MobiRouter.currentTemplate();
    });

})(Handlebars);