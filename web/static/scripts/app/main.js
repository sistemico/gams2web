requirejs.config({
    paths: {
        'text': '../vendor/require/text',
        'durandal': '../vendor/durandal',
        'plugins': '../vendor/durandal/plugins',
        'transitions': '../vendor/durandal/transitions',
        'knockout': '../vendor/knockout/knockout-2.3.0',
        'bootstrap': '../vendor/bootstrap/bootstrap',
        'jquery': '../vendor/jquery/jquery-2.0.3',
        'i18next': '../vendor/i18next/i18next.amd.withJQuery-1.7.1'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'durandal/binder', 'i18next', 'bootstrap'], function (system, app, viewLocator, binder, i18n) {
    var i18NOptions = {
        lng: (window.navigator.userLanguage || window.navigator.language).split('-')[0] || 'es',
        fallbackLng: false,
        detectFromHeaders: false,
        detectLngQS: 'lang',
        useCookie: true,
        cookieName: 'lang',
        resGetPath: 'static/scripts/app/locales/__lng__.json'
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