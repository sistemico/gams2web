define(['plugins/http', 'durandal/app', 'knockout'], function (http, app, ko) {
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
            //return app.showMessage('Are you sure you want to leave this page?', 'Navigate', ['Yes', 'No']);
            return true
        },

        select: function(item) {
            //item.viewUrl = 'views/detail';
            //app.showDialog(item);
        }
    };
});