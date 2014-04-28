//
// GAMS Web Interface
//

var gams2web = angular.module('gams2web', [ 'ui.router', 'ui.bootstrap', 'jm.i18next']);

// Matrix field type
gams2web.directive('matrix', function () {
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


// Create a copy of the array and reverse the order of the items
gams2web.filter('reverse', function () {
    return function (items) {
        return items && items.slice().reverse() || [];
    };
});


// App
gams2web.config(function ($stateProvider, $locationProvider, $urlRouterProvider, $i18nextProvider) {
    $locationProvider.html5Mode(true);

    $i18nextProvider.options = {
        lng: 'en',
        fallbackLng: 'es',
        detectLngQS: 'lang',
        resGetPath: '../locales/__lng__/__ns__.json',
        useCookie: false,
        useLocalStorage: false
    };

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'views/home.html',
            controller: function ($scope, $rootScope, $modal, $log, $i18next) {
                var addTask = $scope.addTask = function (model) {
                    $rootScope.data.tasks.push({
                        model: model.title,
                        status: 'Queued'
                    });
                };

                $scope.cancelTask = function (index) {
                    $rootScope.data.tasks.splice(index, 1);
                };

                $scope.openRunModelDialog = function () {
                    var modelSelectionDialog = $modal.open({
                        templateUrl: 'views/modelSelectionDialog.html',
                        controller: function ($scope, $modalInstance, models) {
                            $scope.models = models;

                            $scope.select = function (selectedModel) {
                                $modalInstance.close(selectedModel);

                                var modelParameterDialog = $modal.open({
                                    templateUrl: 'views/modelParameterDialog.html',
                                    backdrop: 'static',
                                    windowClass: 'model-parameter-dialog',
                                    controller: function ($scope, $modalInstance, model) {
                                        $scope.model = model;

                                        $scope.cancel = function () {
                                            $modalInstance.dismiss('cancel');
                                        }

                                        $scope.run = function () {
                                            $modalInstance.close(model);
                                        }
                                    },
                                    resolve: {
                                        model: function () {
                                            return selectedModel;
                                        }
                                    }
                                });

                                modelParameterDialog.result.then(function (result) {
                                    addTask(result);
                                }, function () {
                                    $log.info('Modal dismissed at: ' + new Date());
                                });
                            }

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            }
                        },
                        resolve: {
                            models: function () {
                                return $rootScope.data.models;
                            }
                        }
                    });
                };
            }
        })

        .state('about', {
            url: '/about',
            templateUrl: 'views/about.html'
        });

    $urlRouterProvider.otherwise('/');
});

gams2web.run(function ($rootScope) {
    $rootScope.data = {
        models: [],
        tasks: []
    };

    var socket = io.connect('/api');

    socket.on('connect', function () {
        socket.on('models.all', function (data) {
            $rootScope.$apply(function () {
                angular.forEach(data['models'], function (model) {
                    $rootScope.data.models.push(model);
                });
            });
        });

        socket.on('tasks.all', function (data) {
            $rootScope.$apply(function () {
                angular.forEach(data['tasks'], function (task) {
                    $rootScope.data.tasks.push(task);
                });
            });
        });
    });
});