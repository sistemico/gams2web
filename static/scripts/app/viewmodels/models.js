define(['plugins/http', 'plugins/router', 'durandal/app', 'viewmodels/instances', 'knockout', 'i18next'], function (http, router, app, instances, ko, i18n) {
    return {
        models: ko.observableArray([]),

        activate: function () {
            var self = this;

            if (this.models().length > 0) {
                return;
            }

            return http.get('/api/models', { lang: i18n.lng() }).then(function(data) {
                self.models(data.models);
            });
        },

        canDeactivate: function () {
            return true
        },

        select: function(model) {
            instances.addInstance(model);
            router.navigate("instances");
        }
    };
});