requirejs.config({
    baseUrl: '/assets',
    paths: {
        'angular': 'vendor/angular/angular',
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router',
        'angular-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls',
        'angular-cookies': 'vendor/angular-cookies/angular-cookies',
        'angular-translate': 'vendor/angular-translate/angular-translate',
        'angular-translate-loader': 'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files',
        'socket.io-client': 'vendor/socket.io-client/dist/socket.io'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-bootstrap': {
            deps: ['angular']
        },
        'angular-cookies': {
            deps: ['angular']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'angular-bootstrap': {
            deps: ['angular']
        },
        'angular-translate': {
            deps: ['angular']
        },
        'angular-translate-loader': {
            deps: ['angular-translate']
        }
    }
});

// Bootstrapping
require(['app/main']);
