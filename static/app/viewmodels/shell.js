define(['plugins/router', 'durandal/app', 'i18next'], function (router, app, i18n) {
    return {
        router: router,

        activate: function () {
            router.map([
                { route: ['', 'models'], title: i18n.t('menu.models'), moduleId: 'viewmodels/models', nav: true },
                { route: 'instances', title: i18n.t('menu.instances'), moduleId: 'viewmodels/instances', nav: true },
                { route: 'about', title: i18n.t('menu.about'), moduleId: 'viewmodels/about', nav: true },
                { route: 'contact', title: i18n.t('menu.contact'), moduleId: 'viewmodels/contact', nav: true },
            ]).buildNavigationModel();
            
            return router.activate();
        },

        message: function() {
            app.showMessage('Not yet implemented...');
        }
    };
});