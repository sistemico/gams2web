define(['knockout'], function (ko) {
    var context = {
        instances: ko.observableArray(),
        models: ko.observableArray()
    };

    var socket = io.connect('/api');

    socket.on('connect', function() {
        socket.on('models.all', function(data) {
            context.models(data['models']);
        });

        socket.on('tasks.all', function(data) {
            context.instances(data['tasks']);
        });
    });

    return context;
});
