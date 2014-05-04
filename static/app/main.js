define(['angular', 'app/data', 'angular-cookies', 'angular-ui-router', 'angular-bootstrap', 'angular-translate-loader'],
    function (angular, data) {
        angular.module('gams2web', ['ngCookies', 'ui.router', 'ui.bootstrap', 'pascalprecht.translate'])

            .controller('MainCtrl', ['$scope', '$state', '$translate', '$modal',
                function ($scope, $state, $translate, $modal) {
                    $scope.languages = {
                        'English': 'en',
                        'Español': 'es'
                    };

                    $scope.changeLanguage = function (lang) {
                        $translate.use(lang);
                    };

                    $scope.currentLanguage = function () {
                        return $translate.use();
                    };

                    $scope.showModelListDialog = function () {
                        $modal.open({ templateUrl: 'views/model-list-dialog.html' });
                    };

                    $scope.showAboutDialog = function () {
                        $modal.open({ templateUrl: 'views/about-dialog.html' });
                    };

                    $scope.run = function (model) {
                        data.addTask(model);
                        $state.go('home');
                    }
                }])

            .factory('configStorage', function ($window, $cookieStore) {
                return {
                    set: function (name, value) {
                        try {
                            $window.localStorage.setItem(name, value);
                        } catch (e) {
                            $cookieStore.put(name, value);
                        }
                    },
                    get: function (name) {
                        try {
                            return $window.localStorage.getItem(name);
                        } catch (e) {
                            return $cookieStore.get(name);
                        }
                    }
                }
            })

            .config(function ($locationProvider, $stateProvider, $urlRouterProvider, $translateProvider) {
                $locationProvider.html5Mode(true);

                $stateProvider
                    .state('home', {
                        url: '/',
                        views: {
                            'header': {
                                templateUrl: 'views/navigation.html'
                            },
                            'content@': {
                                templateUrl: 'views/dashboard.html'
                            },
                            'footer': {
                                templateUrl: 'views/footer.html'
                            },
                        },
                    })
                    .state('model', {
                        url: '{model}',
                        parent: 'home',
                        views: {
                            'content@': {
                                templateUrl: 'views/model-run.html',
                                controller: function ($scope, model) {
                                    $scope.model = model;
                                }
                            }
                        },
                        resolve: {
                            model: function ($stateParams) {
                                return data.getModelInfo($stateParams.model);
                            }
                        }
                    });

                $urlRouterProvider.otherwise('/');

                // Multi-language support
                $translateProvider
                    .useStaticFilesLoader({ prefix: 'locales/', suffix: '.json' })
                    .useStorage('configStorage')
                    .determinePreferredLanguage(function () {
                        var lang = navigator.language || navigator.userLanguage;
                        return lang && lang.substring(0, 2) || 'es';
                    })


            })

            .run(function ($rootScope) {
                $rootScope.data = data;
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
            });

        // Bootstrapping
        angular.element(document).ready(function () {
            angular.bootstrap(document, ['gams2web']);
        });
    });