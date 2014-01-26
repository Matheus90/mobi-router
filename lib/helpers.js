(function(Handlebars){
    Handlebars.registerHelper('MobiRouter', function(){
        return MobiRouter;
    });

    Handlebars.registerHelper('currentTemplate', function(){
        return MobiRouter.currentTemplate();
    });

    Handlebars.registerHelper('isSequence', function(){
        return MobiRouter.isSequence();
    });
})(Handlebars);