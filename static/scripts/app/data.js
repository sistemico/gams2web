define(['knockout', 'backend'], function (ko, backend) {
    var context = {
        models: ko.observableArray(),
        instances: ko.observableArray()
    };

    backend.connect().then(function() {
        backend.on('models.all', function(data) {
            context.models(data['models']);
        });

        backend.on('tasks.all', function(data) {
            context.instances(data['tasks']);
        });
    });

    return context;
});
