requirejs.config({
    paths: {
        'text': '../vendor/require/text',
        'durandal':'../vendor/durandal',
        'plugins' : '../vendor/durandal/plugins',
        'transitions' : '../vendor/durandal/transitions',
        'knockout': '../vendor/knockout/knockout-2.3.0',
        'bootstrap': '../vendor/bootstrap/bootstrap',
        'jquery': '../vendor/jquery/jquery-2.0.3'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
       }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'bootstrap'],  function (system, app, viewLocator) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'GAMS Web Interface';

    app.configurePlugins({
        router:true,
        dialog: true,
        widget: true
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application.
        app.setRoot('viewmodels/shell');
    });
});