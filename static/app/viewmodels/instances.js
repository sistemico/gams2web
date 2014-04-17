define(['plugins/http', 'plugins/router', 'app/data', 'knockout'], function (http, router, data, ko) {
    return {
        instances: data.instances,

        activate: function () {
            if (data.instances().length > 0) return;
        },

        addInstance: function (model) {
            var modelInstances = ko.utils.arrayFilter(this.instances(),function (i) {
                return i.instance.indexOf(model.name + "-") == 0;
            });

            this.instances.push({
                "model": model.title,
                "instance": model.name + "-" + (modelInstances.length + 1),
                "remainingTime": "estimating..."
            });
        },

        removeInstance: function (instance) {
            this.instances.remove(instance);
        }
    };
});