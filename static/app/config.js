requirejs.config({
  baseUrl: '/assets',
  paths: {
    'angular': 'vendor/angular/angular',
    'angular-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls',
    'angular-cookies': 'vendor/angular-cookies/angular-cookies',
    'angular-i18n': 'vendor/angular-i18n/angular-locale_es-ar',
    'angular-loading-bar': 'vendor/angular-loading-bar/build/loading-bar',
    'angular-moment': 'vendor/angular-moment/angular-moment',
    'angular-translate': 'vendor/angular-translate/angular-translate',
    'angular-translate-loader': 'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files',
    'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router',
    'angular-underscore': 'vendor/angular-underscore/angular-underscore',
    'moment': 'vendor/moment/min/moment-with-locales',
    'moment-timezone': 'vendor/moment-timezone/builds/moment-timezone-with-data',
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
