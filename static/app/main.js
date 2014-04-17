requirejs.config({
    baseUrl: '/static',
    paths: {
        // Libraries
        'text': 'vendor/requirejs-text/text',
        'durandal': 'vendor/durandal/js',
        'plugins': 'vendor/durandal/js/plugins',
        'transitions': 'vendor/durandal/js/transitions',
        'knockout': 'vendor/knockout.js/knockout',
        'bootstrap': 'vendor/bootstrap/dist/js/bootstrap',
        'jquery': 'vendor/jquery/jquery',
        'i18next': 'vendor/i18next/i18next.amd.withJQuery',

        // App
        'viewmodels': 'app/viewmodels',
        'views': 'app/views'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'durandal/binder', 'i18next', 'bootstrap', 'app/data'], function (system, app, viewLocator, binder, i18n) {
    var i18NOptions = {
        lng: (window.navigator.userLanguage || window.navigator.language).split('-')[0] || 'es',
        fallbackLng: false,
        detectFromHeaders: false,
        detectLngQS: 'lang',
        useCookie: true,
        cookieName: 'lang',
        resGetPath: 'static/app/locales/__lng__.json'
    };

    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.configurePlugins({
        router: true,
        dialog: true,
        widget: true
    });

    app.start().then(function () {
        i18n.init(i18NOptions, function () {
            app.title =  i18n.t('site.title');

            binder.bindingComplete = function (obj, view) {
                $(view).i18n();
            };

            // Replace 'viewmodels' in the moduleId with 'views' to locate the view.
            // Look for partial views in a 'views' folder in the root.
            viewLocator.useConvention();

            // Show the app by setting the root view model for our application.
            app.setRoot('viewmodels/shell');
        });
    });
});
