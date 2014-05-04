requirejs.config({
    baseUrl: '/',
    paths: {
        'angular': 'vendor/angular/angular.min',
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angular-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-cookies': 'vendor/angular-cookies/angular-cookies.min',
        'angular-translate': 'vendor/angular-translate/angular-translate',
        'angular-translate-loader': 'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files'
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
