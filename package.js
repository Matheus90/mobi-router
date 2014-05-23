Package.describe({
    summary: "Simple router made for meteor apps designed specifically for mobile devices"
});

Package.on_use(function (api, where) {
    api.use(['templating', 'handlebars', 'deps', 'session'], ['client', 'server']);


    api.add_files([
        'lib/js/slog.js'
    ], ['client', 'server']);

    api.add_files([
        'lib/js/touch.js',
        //'lib/js/animation.js',
        'lib/js/animation2.js',
        'lib/js/easing.js',
        'lib/js/clickbuster.js',
        'lib/js/inheritance.js',
        'lib/js/iscroll.js',
        //'lib/js/iscroll-5-probe.js',
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
        api.export(['MobiRouter','MobiResizeable','ClickBuster', 'slog']);
});
