define(['plugins/router', 'durandal/app'], function (router, app) {
    return {
        router: router,

        activate: function () {
            router.map([
                { route: ['', 'models'], title:'Models', moduleId: 'viewmodels/models', nav: true },
                { route: 'instances', title:'Instances', moduleId: 'viewmodels/instances', nav: true },
                { route: 'about', title:'About', moduleId: 'viewmodels/about', nav: true },
                { route: 'contact', title:'Contact', moduleId: 'viewmodels/contact', nav: true }
            ]).buildNavigationModel();
            
            return router.activate();
        },

        message: function() {
            app.showMessage('Not yet implemented...');
        }
    };
});