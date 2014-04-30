define(['angular', 'angular-ui-router', 'angular-bootstrap', 'ng-i18next', 'app/data'], function (angular, uiRouter, uiBootstrap, i18next, data) {
    angular.module('gams2web', [ 'ui.router', 'ui.bootstrap'/*, 'jm.i18next'*/])

        .run(function ($rootScope) {
            $rootScope.data = data;
        })

        .config(function ($locationProvider, $stateProvider, $urlRouterProvider/*, $i18nextProvider*/) {
            $locationProvider.html5Mode(true);
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    views: {
                        header: {
                            templateUrl: 'views/navigation.html'
                        }
                    }
                })
                .state('root.home', {
                    url: '/',
                    views: {
                        'content@': {
                            templateUrl: 'views/dashboard.html',
                            controller: function ($scope, $rootScope, $modal) {
                                $scope.showModelListDialog = function () {
                                    $modal.open({
                                        templateUrl: 'views/model-list-dialog.html'
                                    });
                                };
                            }
                        }
                    },
                })
                .state('root.about', {
                    url: '/about',
                    views: {
                        'content@': {
                            templateUrl: 'views/about.html'
                        }
                    }
                })
                .state('root.run', {
                    url: '/{model}',
                    views: {
                        'content@': {
                            templateUrl: 'views/model-run.html',
                            controller: function ($scope, $rootScope, $state, $stateParams) {
                                $scope.model = $rootScope.data.getModelInfo($stateParams.model);

                                $scope.run = function () {
                                    data.addTask($scope.model);
                                    $state.go('root.home');
                                }
                            }
                        }
                    }
                });

            /*$i18nextProvider.options = {
                lng: 'en',
                fallbackLng: 'es',
                detectLngQS: 'lang',
                resGetPath: '../locales/__lng__/__ns__.json',
                useCookie: false,
                useLocalStorage: false
            };*/
        })

        // WebSocket API
        .factory('socket', function ($q) {
            var self = {
                socket: null,

                connect: function () {
                    self.socket = io.connect('/api');

                    return self.on('connect');
                },

                on: function (event) {
                    var deferred = $q.defer();

                    self.socket.on(event, function (data) {
                        deferred.resolve(data);
                    });

                    return deferred.promise;
                }
            };

            return self;
        })

        // Filter: Create a copy of the array and reverse the order of the items
        .filter('reverse', function () {
            return function (items) {
                return items && items.slice().reverse() || [];
            };
        })

        // Custom field: matrix
        .directive('matrix', function () {
            return {
                templateUrl: 'views/fields/matrix.html',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: { nrows: '@', ncols: '@', val: '=value' },

                link: function (scope, element, attrs) {
                    var range = function (upper) {
                        return Array.apply(null, Array(parseInt(upper))).map(function (_, i) {
                            return i + 1 + '';
                        });
                    };

                    scope.rows = range(attrs.nrows);
                    scope.columns = range(attrs.ncols);

                    scope.value = {};

                    angular.forEach(scope.rows, function (row) {
                        scope.value[row] = {};

                        angular.forEach(scope.columns, function (column) {
                            scope.value[row][column] = null;
                        });
                    });
                }
            }
        })


    // Bootstrapping
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['gams2web']);
    });
});