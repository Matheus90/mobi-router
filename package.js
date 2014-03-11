Package.describe({
    summary: "Simple router for mobile displaying with sidebar"
});

Package.on_use(function (api, where) {
    api.use(['templating', 'handlebars', 'deps', 'session'], 'client');

    api.add_files([
        'lib/js/_touch.js',
        'lib/js/animation.js',
        'lib/js/easing.js',
        'lib/js/fast_buttons.js',
        'lib/js/inheritance.js',
        'lib/js/iscroll.js',
        'lib/js/resizeable.js',
        'lib/helpers.js',
        'lib/mobi_route.js',
        'lib/mobi_router.css',
        'lib/mobi_router.js',
        'lib/mobi_sequence.js',
        'lib/templates.html',
        'lib/templates.js'
    ], 'client');

    if (api.export)
        api.export(['MobiRouter','MobiResizeable']);
});