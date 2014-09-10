requirejs.config({
  baseUrl: '/assets',
  paths: {
    'angular': 'vendor/angular/angular.min',
    'angular-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls.min',
    'angular-cookies': 'vendor/angular-cookies/angular-cookies.min',
    'angular-i18n': 'vendor/angular-i18n/angular-locale_es-ar',
    'angular-loading-bar': 'vendor/angular-loading-bar/build/loading-bar.min',
    'angular-moment': 'vendor/angular-moment/angular-moment.min',
    'angular-translate': 'vendor/angular-translate/angular-translate.min',
    'angular-translate-loader': 'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
    'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router.min',
    'angular-underscore': 'vendor/angular-underscore/angular-underscore.min',
    'moment': 'vendor/moment/min/moment-with-locales.min',
    'moment-timezone': 'vendor/moment-timezone/builds/moment-timezone-with-data.min',
    'socket.io-client': 'vendor/socket.io-client/dist/socket.io.min',
    'underscore': 'vendor/underscore/underscore-min'
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
    'angular-loading-bar': {
      deps: ['angular']
    },
    'angular-moment': {
      deps: ['angular', 'moment-timezone']
    },
    'angular-translate': {
      deps: ['angular']
    },
    'angular-translate-loader': {
      deps: ['angular-translate']
    },
    'angular-ui-router': {
      deps: ['angular']
    },
    'angular-underscore': {
      deps: ['angular', 'underscore']
    },
    'moment-timezone': {
      deps: ['moment']
    }
  }
});

// Bootstrapping
require(['app/main']);
