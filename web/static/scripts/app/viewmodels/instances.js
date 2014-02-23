define(['plugins/http', 'plugins/router', 'knockout'], function (http, router, ko) {
    return {
        instances: ko.observableArray([]),

        activate: function () {
            var self = this;

            if (this.instances().length > 0) {
                return;
            }

            return http.get('/api/instances').then(function (data) {
                self.instances(data.instances);
            });
        },

        addInstance: function (model) {
            var modelInstances = ko.utils.arrayFilter(this.instances(),function (i) {
                return i.instance.indexOf(model.name + "-") == 0;
            });

            this.instances.push({
                "model": model.title,
                "instance": model.name + "-" + (modelInstances.length + 1),
                "status": "Queued",
                "remainingTime": "estimating..."
            });
        },

        removeInstance: function (instance) {
            this.instances.remove(instance);
        }
    };
});