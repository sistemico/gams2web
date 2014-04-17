define(['durandal/system', 'knockout'], function (system, ko) {
    var socket = null;

    return {
        connect: function() {
            return system.defer(function(dfd) {
                socket = io.connect('/api');
                socket.on('connect', dfd.resolve);
            }).promise();
        },

        on: function(event, fn) {
            if (socket) {
                socket.on(event, fn);
            } else {
                this.connect().done(function() {
                    socket.on(event, fn);
                });
            }
        }
    };
});
