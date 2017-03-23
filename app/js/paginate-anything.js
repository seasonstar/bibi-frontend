(function() {
  'use strict';

  function quantize(i) {
    if(i === Infinity) { return Infinity; }
    return i;
  }

  // don't overwrite default response transforms
  function appendTransform(defaults, transform) {
    defaults = angular.isArray(defaults) ? defaults : [defaults];
    return (transform) ? defaults.concat(transform) : defaults;
  }

  angular.module('bgf.paginateAnything', []).

    factory('pageStore', function(){
        var page = 0;
        return {
            setPage: function (p) {
                page = p;
            },
            getPage: function () {
                return page;
            }
        };
    }).
    directive('bgfPagination', function (pageStore) {
      var defaultLinkGroupSize = 3, defaultClientLimit = 250, defaultPerPage = 50;

      return {
        restrict: 'AE',
        scope: {
          // required
          url: '=',
          collection: '=',

          // optional
          urlParams: '=?',
          headers: '=?',
          page: '=?',
          perPage: '=?',
          clientLimit: '=?',
          linkGroupSize: '=?',
          reloadPage: '=?',
          size: '=?',
          passive: '@',

          // directive -> app communication only
          numPages: '=?',
          numItems: '=?',
          serverLimit: '=?',
        },
        templateUrl: function(element, attr) {
          return attr.templateUrl || 'paginate-anything.html';
        },
        replace: true,
        controller: ['$scope', '$http', function($scope, $http) {

          $scope.reloadPage   = false;
          $scope.serverLimit  = Infinity; // it's not known yet
          $scope.Math         = window.Math; // Math for the template


          var lgs = $scope.linkGroupSize, cl = $scope.clientLimit;
          $scope.linkGroupSize  = typeof lgs === 'number' ? lgs : defaultLinkGroupSize;
          $scope.clientLimit    = typeof cl  === 'number' ? cl : defaultClientLimit;

          $scope.gotoPage = function (i) {
            if(i < 0 || i*$scope.perPage >= $scope.numItems) {
              return;
            }
            $scope.page = i;
          };

          $scope.linkGroupFirst = function() {
            var rightDebt = Math.max( 0,
              $scope.linkGroupSize - ($scope.numPages - 1 - ($scope.page + 2))
            );
            return Math.max( 0,
              $scope.page - ($scope.linkGroupSize + rightDebt)
            );
          };

          $scope.linkGroupLast = function() {
            var leftDebt = Math.max( 0,
              $scope.linkGroupSize - ($scope.page - 2)
            );
            return Math.min( $scope.numPages-1,
              $scope.page + ($scope.linkGroupSize + leftDebt)
            );
          };

          $scope.isFinite = function() {
            return $scope.numPages < Infinity;
          };

          function requestRange(request) {
            $scope.$emit('pagination:loadStart', request);
            $http({
              method: 'GET',
              url: $scope.url,
              params: angular.extend(
                {}, $scope.urlParams,
                { page: request.page, per_page: request.per_page}
              ),
            }).then(function (data, status, headers, config) {
              var response = data;
              if(status === 204 || (response && response.total === 0)) {
                $scope.numItems = 0;
                $scope.collection = [];
              } else {
                $scope.numItems = response ? response.total : data.items.length;
                $scope.collection = data.items || [];
              }

              $scope.numPages = Math.ceil($scope.numItems / ($scope.perPage || defaultPerPage));

              $scope.$emit('pagination:loadPage', status, config);
            }).catch(function (data, status, headers, config) {
              $scope.$emit('pagination:error', status, config);
            });
          }

          $scope.page = pageStore.getPage() || 0;
          $scope.size = $scope.size || 'md';

          $scope.$watch('page', function(newPage, oldPage) {
            if($scope.passive === 'true') { return; }

            if(newPage !== oldPage) {
              if(newPage < 0 || newPage*$scope.perPage >= $scope.numItems) {
                return;
              }

              var pp = $scope.perPage || defaultPerPage;

              requestRange({
                page: newPage,
                per_page: pp
              });
            }
          });

          $scope.$watch('perPage', function(newPp, oldPp) {
            if($scope.passive === 'true') { return; }

            if(typeof(oldPp) === 'number' && newPp !== oldPp) {
              var first = $scope.page * oldPp;
              var newPage = Math.floor(first / newPp);

              if($scope.page !== newPage) {
                $scope.page = newPage;
              } else {
                requestRange({
                  page: $scope.page,
                  per_page: newPp
                });
              }
            }
          });

          $scope.$watch('serverLimit', function(newLimit, oldLimit) {
            if($scope.passive === 'true') { return; }

            if(newLimit !== oldLimit) {
            }
          });

          $scope.$watch('page', function(newPage, oldPage) {
            if($scope.passive === 'true') { return; }

            if(newPage !== oldPage) {
                pageStore.setPage(newPage);
            }
          });


          $scope.$watch('url', function(newUrl, oldUrl) {
            if($scope.passive === 'true') { return; }

            if(newUrl !== oldUrl) {
              if($scope.page === 0){
                $scope.reloadPage = true;
              } else {
                $scope.page = 0;
              }
            }
          });

          $scope.$watch('urlParams', function(newParams, oldParams) {
            if($scope.passive === 'true') { return; }

            if(!angular.equals(newParams, oldParams)) {
              if($scope.page === 0){
                $scope.reloadPage = true;
              } else {
                $scope.page = 0;
              }
            }
          }, true);

          $scope.$watch('reloadPage', function(newVal, oldVal) {
            if($scope.passive === 'true') { return; }

            if(newVal === true && oldVal === false) {
              $scope.reloadPage = false;
              requestRange({
                page: $scope.page,
                per_page: $scope.perPage
              });
            }
          });

          var pp = $scope.perPage || defaultPerPage;

          requestRange({
            page: $scope.page,
            per_page: pp
          });
        }]
      };
    }).

    filter('makeRange', function() {
      // http://stackoverflow.com/a/14932395/3102996
      return function(input) {
        var lowBound, highBound;
        switch (input.length) {
        case 1:
          lowBound = 0;
          highBound = parseInt(input[0], 10) - 1;
          break;
        case 2:
          lowBound = parseInt(input[0], 10);
          highBound = parseInt(input[1], 10);
          break;
        default:
          return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++) { result.push(i); }
        return result;
      };
    });

}());
