define(['plugins/http', 'plugins/router', 'durandal/app', 'viewmodels/instances', 'app/data', 'knockout', 'i18next'], function (http, router, app, instances, data, ko, i18n) {
    return {
        models: data.models,

        activate: function () {
            if (this.models.length > 0) return;
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