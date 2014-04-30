Package.describe({
    summary: "Simple router for mobile displaying with sidebar"
});

Package.on_use(function (api, where) {
    api.use(['templating', 'handlebars', 'deps', 'session'], 'client');

    api.add_files([
        'lib/js/touch.js',
        'lib/js/animation.js',
        'lib/js/easing.js',
        'lib/js/clickbuster.js',
        'lib/js/inheritance.js',
        'lib/js/iscroll.js',
        'lib/js/resizeable.js',
        'lib/viewtypes/detailview.html',
        'lib/viewtypes/detailview.js',
        'lib/viewtypes/tableview.html',
        'lib/viewtypes/tableview.js',
        'lib/viewtypes/tableview.css',
        'lib/helpers.js',
        'lib/mobi_route.js',
        'lib/mobi_router.css',
        'lib/mobi_router.js',
        'lib/templates.html',
        'lib/templates.js'
    ], 'client');

    if (api.export)
        api.export(['MobiRouter','MobiResizeable','ClickBuster']);
});
