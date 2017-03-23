define(['angular'], function (angular) {

    var appDirectives = angular.module('maybi.directives', ['ngRoute', 'ngCookies', 'angular-carousel', 'ngTouch']);

    appDirectives.directive('pageHeader', function () {
        return {
            restrict: 'A',
            templateUrl: 'static/partials/header.html'
        };
    });

    appDirectives.directive('routeLoadingIndicator', function($rootScope) {
        return {
            restrict: 'E',
            replace: true,
            link: function(scope, elem, attrs) {
                scope.isRouteLoading = false;

                $rootScope.$on('$routeChangeStart', function() {
                    scope.isRouteLoading = true;
                });
                $rootScope.$on('$routeChangeSuccess', function() {
                    scope.isRouteLoading = false;
                });
            },
            templateUrl: "static/partials/loadingSpinner.html",
        };
    });

    appDirectives.directive('itemBox', function() {
        return {
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs) {
            },

            templateUrl: 'static/partials/item-box.html',
        };
    });

    appDirectives.directive('likeIcon', function() {
        return {
            restrict: 'E',
            scope: {
                item: '=',
            },
            replace: true,
            controller: function($scope, FetchData) {
                $scope.favor = function(item_id){
                    FetchData.get('/api/items/favor/'+item_id).then(function(data){
                        $scope.item.is_favored = true;

                    });
                }
                $scope.unfavor = function(item_id){
                    FetchData.get('/api/items/unfavor/'+item_id).then(function(data){
                        $scope.item.is_favored = false;
                    })
                }

            },
            templateUrl: 'static/partials/like-icon.html',
        };
    });

    appDirectives.directive('specsDialog', function() {
        return {
            restrict: 'E',
            scope: {
                item: '=',
                onClose: '&?',
                btn: '@'
            },
            replace: true,
            link: function(scope, element, attrs) {
            },
            controller: function($scope, FetchData, $timeout) {
                $scope.specsBoxShown = false;
                $scope.modalShown = false;
                $scope.specsBox = function(item_id) {
                    $scope.specsBoxShown = true;
                    $timeout(function(){
                        $scope.modalShown = true;
                    }, 100);
                    FetchData.get('/api/items/'+$scope.item.item_id).then(function(data) {
                        $scope.selectedItem = data.item;
                        $scope.specs = data.item.specs;
                        $scope.selectedSpec = $scope.specs[0];

                        // 可选属性与属性列表组成的字典
                        $scope.attrChoices = {};
                        angular.forEach($scope.selectedItem.attributes_desc, function(key, value) {
                            var attrChoices = [];
                            angular.forEach($scope.specs, function(s){
                                this.push(s.attributes[value]);
                            }, attrChoices);
                            $scope.attrChoices[value] = unique(attrChoices);
                        });

                    });
                };
                $scope.hideModal = function() {
                    $timeout(function() {
                        $scope.specsBoxShown = false;
                    }, 500);
                    $scope.modalShown = false;
                };

                $scope.quantity = 1;
                $scope.setQuantity = function(quantity, relative) {
                    var quantityInt = parseInt(quantity);
                    if (quantityInt % 1 === 0){
                        if (relative === true){
                            $scope.quantity  += quantityInt;
                        } else {
                            $scope.quantity = quantityInt;
                        }
                        if ($scope.quantity < 1) $scope.quantity = 1;
                        if ($scope.quantity >= 5) $scope.quantity = 5;

                    } else {
                        $scope.quantity = 1;
                        alert('Quantity must be an integer and was defaulted to 1');
                    }
                };
                $scope.subTotal = function(price, quantity) {
                    return parseFloat(price * quantity);
                }

                $scope.selectedAttr = {};
                $scope.setAttr = function(k, val) {
                    $scope.selectedAttr[k]= val;
                    $scope.selectedSpec = containsObj($scope.selectedAttr, $scope.specs);
                    $scope.remainSpec = remainSpecs(k,val, $scope.specs);
                    $scope.selectedSpecData = {'item': $scope.selectedItem,
                        'spec': $scope.selectedSpec};
                };

                // 移除列表中重复的项
                function unique(arr){
                    for(var i=0;i<arr.length;i++)
                        for(var j=i+1;j<arr.length;j++)
                            if(arr[i]===arr[j]){arr.splice(j,1);j--;}
                    return arr;
                }

                //  根据已选属性筛选出有效属性的选择
                var remainSpecs = function(k, val, list) {
                    var keys = [];
                    for (var i = 0; i < list.length; i++) {
                        for (var kk in list[i].attributes){
                            if (kk != k && list[i].attributes[k] == val ) {
                                keys.push(list[i].attributes[kk]);
                            } else if (kk == k) {
                                keys.push(list[i].attributes[k]);
                            }
                        }
                    }
                    return unique(keys);
                };

                // 判断obj是否存在列表中，是则返回此对象，否则返回null
                var containsObj = function(obj, list) {
                    for (var i = 0; i < list.length; i++) {
                        if (angular.equals(list[i].attributes, obj)) {
                            return list[i];
                        }
                    }
                    return null;
                }
            },
            templateUrl: 'static/partials/specs-dialog.html',
        };
    });

    return appDirectives;
});
