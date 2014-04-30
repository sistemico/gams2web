requirejs.config({
    baseUrl: '/',
    paths: {
        'angular': 'vendor/angular/angular.min',
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angular-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls.min',
        'i18next': 'vendor/i18next/i18next.min',
        'ng-i18next': 'vendor/ng-i18next/dist/ng-i18next'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-ui-router': {
            deps: ['angular'],
            exports: 'angular'
        },
        'angular-bootstrap': {
            deps: ['angular'],
            exports: 'angular'
        },
        'i18next': {
            exports: 'i18n'
        },
        'ng-i18next': {
            deps: ['angular', 'i18next'],
            exports: 'angular'
        }
    }
});

// Bootstrapping
require(['app/main']);
