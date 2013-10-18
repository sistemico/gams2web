define(['plugins/http', 'knockout'], function (http, ko) {
    return {
        instances: ko.observableArray([]),

        activate: function () {
            var self = this;

            return http.get('/api/instances').then(function(data) {
                self.instances(data.instances);
            });
        }
    };
});