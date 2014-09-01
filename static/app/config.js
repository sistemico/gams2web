requirejs.config({
    baseUrl: '/assets',
    paths: {
        'angular': 'vendor/angular/angular',
        'angular-i18n': 'vendor/angular-i18n/angular-locale_es-ar',
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router',
        'angular-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls',
        'angular-cookies': 'vendor/angular-cookies/angular-cookies',
        'angular-translate': 'vendor/angular-translate/angular-translate',
        'angular-translate-loader': 'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files',
        'angular-underscore': 'vendor/angular-underscore/angular-underscore',
        'socket.io-client': 'vendor/socket.io-client/dist/socket.io',
        'underscore': 'vendor/underscore/underscore'
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
        'angular-i18n': {
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
        },
        'angular-underscore': {
            deps: ['angular', 'underscore']
        }
    }
});

// Bootstrapping
require(['app/main']);
