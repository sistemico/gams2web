define(['plugins/http', 'plugins/router', 'durandal/app', 'viewmodels/instances', 'knockout'], function (http, router, app, instances, ko) {
    return {
        models: ko.observableArray([]),

        activate: function () {
            var self = this;

            if (this.models().length > 0) {
                return;
            }

            return http.get('/api/models').then(function(data) {
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