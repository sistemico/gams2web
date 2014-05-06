define(['angular', 'socket.io-client', 'angular-cookies', 'angular-ui-router', 'angular-bootstrap', 'angular-translate-loader'], function (angular, io) {
    angular.module('gams2web', ['ngCookies', 'ui.router', 'ui.bootstrap', 'pascalprecht.translate'])

        .config(function ($locationProvider, $stateProvider, $urlRouterProvider, $translateProvider) {
            $locationProvider.html5Mode(true);

            $stateProvider
                .state('home', {
                    url: '/',
                    views: {
                        'header': {
                            templateUrl: '/assets/views/navigation.html'
                        },
                        'content@': {
                            templateUrl: '/assets/views/dashboard.html'
                        },
                        'footer': {
                            templateUrl: '/assets/views/footer.html'
                        },
                    },
                })
                .state('runModel', {
                    url: 'run/{model}',
                    parent: 'home',
                    resolve: {
                        model: function ($stateParams, backend) {
                            return backend.getModelInfo($stateParams.model);
                        }
                    },
                    views: {
                        'content@': {
                            templateUrl: '/assets/views/model-run.html',
                            controller: function ($scope, $state, model) {
                                $scope.model = model;
                            }
                        }
                    },
                    onEnter: function ($state, model) {
                        if (!model) $state.go('home', {}, { location: 'replace' });
                    }
                });

            $urlRouterProvider.otherwise('/');

            // Multi-language support
            $translateProvider
                .useStaticFilesLoader({ prefix: '/assets/locales/', suffix: '.json' })
                .useStorage('configStorage')
                .determinePreferredLanguage(function () {
                    var lang = navigator.language || navigator.userLanguage;
                    return lang && lang.substring(0, 2) || 'es';
                });
        })

        .run(function ($rootScope, dataContext) {
            $rootScope.data = dataContext;
        })

        // Main controller
        .controller('MainCtrl', ['$scope', '$state', '$translate', '$modal', 'backend',
            function ($scope, $state, $translate, $modal, backend) {
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

                $scope.toggleModelMenu = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.modelMenuVisible = !$scope.modelMenuVisible;
                };

                $scope.showModelListDialog = function () {
                    $modal.open({ templateUrl: '/assets/views/model-list-dialog.html' });
                };

                $scope.showAboutDialog = function () {
                    $modal.open({ templateUrl: '/assets/views/about-dialog.html' });
                };

                $scope.runModel = function (model) {
                    backend.runModel(model);
                    $state.go('home');
                };

                $scope.cancelTask = function (task) {
                    backend.cancelTask(task.id);
                };
            }])

        // Configuration manager
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

        // WebSocket helper
        .factory('socket', function ($rootScope) {
            var socket = io.connect('/api');

            return {
                on: function (event, callback) {
                    socket.on(event, function () {
                        var args = arguments;

                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                },

                emit: function (event, data, callback) {
                    socket.emit(event, data, function () {
                        var args = arguments;

                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    })
                }
            }
        })

        // Data provider
        .factory('dataContext', function (socket) {
            var _models = {}, _tasks = {},

                context = {
                    models: {
                        all: function () {
                            return Object.keys(_models).map(function (id) {
                                return _models[id];
                            })
                        },
                        count: function () {
                            return Object.keys(_models).length;
                        },
                        empty: function () {
                            return Object.keys(_models).length === 0;
                        },
                        notEmpty: function () {
                            return Object.keys(_models).length > 0;
                        },
                        add: function (id, model) {
                            _models[id] = model;
                        },
                        remove: function (id) {
                            delete _models[id];
                        }
                    },

                    tasks: {
                        all: function () {
                            return Object.keys(_tasks).map(function (id) {
                                return _tasks[id];
                            })
                        },
                        count: function () {
                            return Object.keys(_tasks).length;
                        },
                        empty: function () {
                            return Object.keys(_tasks).length === 0;
                        },
                        notEmpty: function () {
                            return Object.keys(_tasks).length > 0;
                        },
                        add: function (id, task) {
                            _tasks[id] = task;
                        },
                        remove: function (id) {
                            delete _tasks[id];
                        }
                    }
                };


            // Data context initialization
            socket.on('connect', function () {
                socket.on('model:all', function (data) {
                    angular.forEach(data['models'], function (model) {
                        context.models.add(model.name, model);
                    });
                });

                socket.on('task:all', function (data) {
                    angular.forEach(data['tasks'], function (task) {
                        context.tasks.add(task.id, task);
                    });
                });

                socket.on('task:canceled', function (id) {
                    context.tasks.remove(id);
                });

                socket.on('task:new', function (task) {
                    context.tasks.add(task.id, task);
                });

                socket.on('task:status', function (update) {
                    angular.forEach(self.tasks, function (task) {
                        if (task.id === update.id) {
                            task.status = update.status;
                        }
                    })
                });

                socket.on('task:result', function (data) {
                    console.log('task:result', data);
                });
            });

            return context;
        })

        // Backend API
        .factory('backend', function ($q, $timeout, socket) {
            var request = function (callback, timeout) {
                var deferred = $q.defer();

                $timeout(function () {
                    deferred.resolve(null);
                }, typeof timeout !== 'undefined' ? timeout : 800);

                callback(deferred);

                return deferred.promise;
            };

            return {
                getModelInfo: function (modelName) {
                    return request(function (deferred) {
                        socket.emit('model:get', modelName);

                        socket.on('model:' + modelName, function (model) {
                            deferred.resolve(model);
                        });
                    });
                },

                runModel: function (model) {
                    socket.emit('model:run', model);
                },

                cancelTask: function (task) {
                    socket.emit('task:cancel', task);
                }
            };
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
                templateUrl: '/assets/views/fields/matrix.html',
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