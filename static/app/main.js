define([
    'underscore', 'angular', 'socket.io-client',
    'angular-i18n', 'angular-cookies',
    'angular-translate-loader', 'angular-translate-storage-cookie', 'angular-translate-storage-local',
    'angular-bootstrap', 'angular-ui-router',
    'angular-loading-bar', 'angular-moment', 'angular-tags-input'
  ],

  function (_, angular, io) {

    angular.module('gams2web', [
      'angular-loading-bar', 'ui.router', 'ui.bootstrap', 'ngTagsInput',
      'ngCookies', 'pascalprecht.translate', 'angularMoment'
    ])

      .config(function ($locationProvider, $stateProvider, $urlRouterProvider, $translateProvider) {
        // Multi-language support
        $translateProvider
          .useLocalStorage()
          .useStaticFilesLoader({prefix: '/assets/locales/', suffix: '.json'})
          .determinePreferredLanguage(function () {
            var lang = navigator.language || navigator.userLanguage;
            return lang && lang.substring(0, 2) || 'es';
          });

        // Enabling HTML 5 mode to remove the # prefix from URL's
        $locationProvider.html5Mode(true);

        // URL States (routes)
        $stateProvider
          .state('app', {
            abstract: true,
            url: '',
            resolve: {
              // Gets app configuration
              config: function ($http) {
                return $http.get('/api/config').then(function (response) {
                  return response.data;
                });
              },
              // Gets models
              models: function ($http, $rootScope, $translate, $sce) {
                var locale = $translate.use() || $translate.proposedLanguage();

                return $http.get('/api/models', {params: {locale: locale}}).then(function (response) {
                  var models = response.data['objects'] || [];

                  _(models).each(function (model) {
                    if (model.instructions && model.instructions.content) {
                      model.instructions.content = $sce.trustAsHtml(model.instructions.content);
                    }

                    _(model.parameters).each(function (field) {
                      if (field.metadata && field.metadata.help_text) {
                        field.metadata.help_text = $sce.trustAsHtml(field.metadata.help_text);
                      }
                    });
                  });

                  $rootScope.models = models

                  return $rootScope.models;
                });
              },
              // Gets tasks
              tasks: function ($http, $rootScope, models) {
                return $http.get('/api/tasks').then(function (response) {
                  var tasks = response.data['objects'] || [];

                  _(tasks).each(function (task) {
                    if (!task.model) {
                      task.model = _(models).findWhere({name: task['model_name']});
                    }
                  });

                  $rootScope.tasks = tasks;

                  return $rootScope.tasks;
                });
              }
            },
            views: {
              'header': {templateUrl: '/assets/views/navigation-menu.html'},
              'footer': {templateUrl: '/assets/views/footer.html'}
            },
            onEnter: function ($rootScope, $state, $stateParams, $http, $modal, $translate, config, api, amMoment) {
              $rootScope._ = _;

              // Localization
              $rootScope.languages = config['locales'];

              $rootScope.currentLanguage = function () {
                return $translate.use() || $translate.proposedLanguage();
              };

              $rootScope.changeLanguage = function (lang) {
                $translate.use(lang);
              };

              amMoment.changeLocale($rootScope.currentLanguage());

              // Reload model i18n on translation change
              $rootScope.$on('$translateChangeSuccess', function () {
                amMoment.changeLocale($rootScope.currentLanguage());

                $state.transitionTo($state.current, $stateParams, {
                  reload: true, inherit: true, notify: true
                });
              });

              // Other shared methods
              $rootScope.toggleModelMenu = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $rootScope.modelMenuVisible = !$rootScope.modelMenuVisible;
              };

              $rootScope.showModelListDialog = function () {
                $modal.open({templateUrl: '/assets/views/model-list-dialog.html'});
              };

              $rootScope.showAboutDialog = function () {
                $modal.open({templateUrl: '/assets/views/about-dialog.html'});
              };

              // Bind backend signals
              $rootScope.api = api;

              api.on('connect', function () {
                api.on('task:new', function (task) {
                  task.model = _($rootScope.models).findWhere({name: task['model_name']});

                  $rootScope.tasks.unshift(task);
                });

                api.on('task:status', function (data) {
                  var task = _($rootScope.tasks).findWhere({id: data['task_id']})

                  if (task) {
                    task.status = data['status'];
                  }
                });

                api.on('task:delete', function (data) {
                  var task = _($rootScope.tasks).findWhere({id: data['task_id']})

                  $rootScope.tasks.splice($rootScope.tasks.indexOf(task), 1);
                });
              });
            }
          })

          /* Home */
          .state('app.home', {
            url: '/',
            views: {
              'content@': {templateUrl: '/assets/views/task-list.html'}
            }
          })

          /* Run model */
          .state('app.run_model', {
            url: '/model/{model_name}',
            resolve: {
              model: function ($stateParams, models) {
                return _(models).findWhere({name: $stateParams['model_name']});
              }
            },
            views: {
              'content@': {
                templateUrl: '/assets/views/model-run.html',
                controller: function ($scope, model) {
                  $scope.model = model;
                  $scope.formData = {};

                  angular.forEach(model.parameters, function (param) {
                    $scope.formData[param.id] = param.type === 'list' ? [] : {};
                  });
                }
              }
            },
            onEnter: function ($state, model) {
              if (!model) $state.go('app.home', {}, {location: 'replace'});
            }
          })

          /* Task report */
          .state('app.task_report', {
            url: '/task/{task_id}',
            resolve: {
              task: function ($stateParams, $http, tasks) {
                var task = _(tasks).findWhere({id: $stateParams['task_id']});

                return $http.get('/api/tasks/' + task.id + '/result').then(function (response) {
                  var result = task.result = response.data, opts = task.model['output_options'];

                  // Apply output options
                  if (opts) {
                    var includeFields = opts['fields'], excludeTypes = opts['exclude_types'];

                    if (includeFields) {
                      result['output'] = _.select(result['output'], function (value) {
                        return _(includeFields).contains(value.name);
                      });
                    }

                    if (excludeTypes) {
                      result['output'] = _.reject(result['output'], function (value) {
                        return _(excludeTypes).contains(value.type);
                      });
                    }
                  }

                  return task;
                });
              }
            },
            views: {
              'content@': {
                templateUrl: '/assets/views/task-report.html',
                controller: function ($scope, $window, task) {
                  $scope.task = task;

                  $scope.decode = function (input) {
                    return $window.atob(input);
                  }
                }
              }
            },
            onEnter: function ($state, task) {
              if (!task) $state.go('app.home', {}, {location: 'replace'});
            }
          });

        // If the path doesn't match any of the configured urls redirect to home
        $urlRouterProvider.otherwise('/');
      })

      .constant('angularMomentConfig', {
        timezone: 'America/Argentina/Cordoba'
      })

      /* WebSocket helper */
      .factory('socket', function ($rootScope) {
        var socket = io.connect('http://' + document.domain + ':' + location.port + '/t');

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
      .factory('api', function ($q, $http, $state, $timeout, socket) {
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

          runModel: function (model, data) {
            return $http.post('/api/models/' + model.name, data).then(function (response) {
              if (response.statusText == 'ACCEPTED') $state.go('app.home');
            });
          },

          deleteTask: function (task) {
            return $http.delete('/api/tasks/' + task.id);
          }
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

      //
      // Filters
      //

      // Create a copy of the array and reverse the order of the items
      .filter('reverse', function () {
        return function (items) {
          return items && items.slice().reverse() || [];
        };
      })

      // Return true or a given text if object has items
      .filter('isEmpty', function () {
        return function (items, replaceText) {
          return items && items.length ? false : replaceText || true;
        };
      })

      // Field
      .directive('field', function () {
        return {
          restrict: 'E',
          replace: true,
          scope: {field: '=options', fieldValue: '=value', fields: '=fieldsData', formData: '='},
          template: '<div ng-include="getTemplateUrl()"></div>',
          transclude: false,

          link: function (scope, element, attrs) {
            scope.field.type = scope.field.type || 'text';

            scope.getTemplateUrl = function () {
              return '/assets/views/fields/' + scope.field.type + '.html';
            };

            // List
            if (scope.field.type === 'list') {
              var strList = scope.field.options.default ? scope.field.options.default.toString() : '';

              var defaultValue = _.compact(
                _.map(strList.split(','), function (s) {
                  return s.trim()
                })
              );

              scope.formData[scope.field.id] = _.map(defaultValue, function (v) {
                  return {text: v.replace(/\s+/g, '-')};
                }
              );
            }

            // Matrix
            if (scope.field.type === 'matrix') {
              scope.range = function (lower, upper, step) {
                var series = [];

                lower = series[0] = parseInt(lower);
                upper = parseInt(upper);
                step = parseInt(step) || 1;

                while (lower + step <= upper) {
                  series[series.length] = lower += step;
                }

                return series;
              };

              scope.formData[scope.field.id] = [];
            }

            // Related field
            if (scope.field.type === 'related') {
              var strList = scope.field.options.default ? scope.field.options.default.toString() : '';

              scope.fieldValue = _.map(strList.split(','), function (s) {
                return scope.field.options.type === 'number' ? Number(s.trim()) : s.trim()
              });
            }

            // Text
            if (scope.field.type === 'text') {
              scope.fieldValue = scope.field.options.type === 'number' ? Number(0) : '';

              var initial = scope.field.options.default;

              if (initial) {
                scope.fieldValue = scope.field.options.type === 'number' ? Number(initial) : initial.toString().trim();
                //scope.formData[scope.field.id] = scope.field.options.default ? Number(scope.field.options.default) : 0;
              }
              /*else {
               scope.formData[scope.field.id] = scope.field.options.default ? scope.field.options.default.toString().trim() : '';
               }*/
            }
          }
        }
      });

    angular.element(document).ready(function () {
      angular.bootstrap(document, ['gams2web']);
    });
  });
