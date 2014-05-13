define(['angular', 'socket.io-client', 'angular-cookies', 'angular-ui-router', 'angular-bootstrap', 'angular-translate-loader'], function (angular, io) {
    angular.module('gams2web', ['ngCookies', 'ui.router', 'ui.bootstrap', 'pascalprecht.translate'])

        .config(function ($locationProvider, $stateProvider, $urlRouterProvider, $translateProvider) {
            $stateProvider
                .state('app', {
                    abstract: true,
                    url: '',
                    resolve: {
                        config: function ($http, $rootScope, $translate) {
                            return $http.get('/api/config').then(function (response) {
                                return response.data;
                            });
                        },
                        models: function ($http, $rootScope, listProvider) {
                            return $http.get('/api/models').then(function (response) {
                                return listProvider.create(response.data);
                            });
                        },
                        tasks: function ($http, $rootScope, listProvider) {
                            return $http.get('/api/tasks').then(function (response) {
                                return listProvider.create(response.data);
                            });
                        }
                    },
                    views: {
                        'header': { templateUrl: '/assets/views/navigation.html' },
                        'footer': { templateUrl: '/assets/views/footer.html' }
                    },
                    onEnter: function ($rootScope, $state, $translate, $modal, config, models, tasks, backend) {
                        // Data
                        $rootScope.models = models;
                        $rootScope.tasks = tasks;

                        // Bind backend signals
                        backend.on('connect', function () {
                            backend.on('new task', function (task) {
                                tasks.add(task.id, task);
                            });

                            backend.on('task canceled', function (id) {
                                var task = tasks.getById(id);

                                if (task) {
                                    task.status = 'REVOKED';
                                }

                                //TODO: tasks.remove(id);
                            });

                            backend.on('task status update', function (data) {
                                var task = tasks.getById(data['task_id']);

                                if (task) {
                                    task.status = data['status'];
                                    task.result = data['result'] && atob(data['result'].trim());
                                }
                            });
                        });

                        $rootScope.runModel = function (model) {
                            backend.runModel(model);
                            $state.go('app.home');
                        };

                        $rootScope.cancelTask = function (task) {
                            backend.cancelTask(task.id);
                        };

                        // Site config
                        $rootScope.languages = config.locales;

                        $rootScope.currentLanguage = function () {
                            return $translate.use();
                        };

                        $rootScope.changeLanguage = function (lang) {
                            $translate.use(lang);
                        };

                        // Other shared methods
                        $rootScope.toggleModelMenu = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $rootScope.modelMenuVisible = !$rootScope.modelMenuVisible;
                        };

                        $rootScope.showModelListDialog = function () {
                            $modal.open({ templateUrl: '/assets/views/model-list-dialog.html' });
                        };

                        $rootScope.showAboutDialog = function () {
                            $modal.open({ templateUrl: '/assets/views/about-dialog.html' });
                        };
                    }
                })

                .state('app.home', {
                    url: '/',
                    views: {
                        'content@': { templateUrl: '/assets/views/dashboard.html' }
                    }
                })

                .state('app.runModel', {
                    url: '/{model}/run',
                    resolve: {
                        model: function ($stateParams, models) {
                            return models.getById($stateParams.model);
                        }
                    },
                    views: {
                        'content@': {
                            templateUrl: '/assets/views/model-run.html',

                            controller: function ($scope, model) {
                                $scope.model = model;
                            }
                        }
                    },

                    onEnter: function ($state, model) {
                        if (!model) $state.go('app.home', {}, { location: 'replace' });
                    }
                })

                .state('app.report', {
                    url: '/report/{taskId}',
                    resolve: {
                        task: function ($stateParams, tasks) {
                            return tasks.getById($stateParams.taskId);
                        }
                    },

                    views: {
                        'content@': {
                            templateUrl: '/assets/views/task-report.html',

                            controller: function ($scope, task) {
                                $scope.task = task;
                            }
                        }
                    },

                    onEnter: function ($state, task) {
                        if (!task) $state.go('app.home', {}, { location: 'replace' });
                    }
                });

            // If the path doesn't match any of the configured urls redirect to home
            $urlRouterProvider.otherwise('/');

            // Enabling HTML 5 mode to remove the # prefix from URL's
            $locationProvider.html5Mode(true);

            // Multi-language support
            $translateProvider
                .useStaticFilesLoader({ prefix: '/assets/locales/', suffix: '.json' })
                .useStorage('configStorage')
                .determinePreferredLanguage(function () {
                    var lang = navigator.language || navigator.userLanguage;
                    return lang && lang.substring(0, 2) || 'es';
                });
        })

        /* WebSocket helper */
        .factory('socket', function ($rootScope) {
            var socket = io.connect();

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

        /* Backend API */
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
                on: socket.on,

                runModel: function (model) {
                    socket.emit('run model', model);
                },

                cancelTask: function (task) {
                    socket.emit('cancel task', task);
                }
            };
        })

        /* Utility for easily manipulating dict-based lists */
        .service('listProvider', function () {
            this.create = function (items) {
                return {
                    all: items,

                    /* Gets all elements in the list. */
                    list: function () {
                        return Object.keys(items).map(function (id) {
                            return items[id];
                        })
                    },

                    /* Gets the number of elements in the list. */
                    count: function () {
                        return Object.keys(items).length;
                    },

                    /* Checks if the list contains no elements. */
                    isEmpty: function () {
                        return Object.keys(items).length === 0;
                    },

                    /* Returns the list item with the specified identifier. */
                    getById: function (id) {
                        return items[id];
                    },

                    /* */
                    add: function (id, task) {
                        items[id] = task;
                    },

                    /* */
                    remove: function (id) {
                        delete tasks[id];
                    }
                };
            };
        })

        /* Configuration manager */
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

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['gams2web']);
    });
});