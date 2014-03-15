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

})(Handlebars);