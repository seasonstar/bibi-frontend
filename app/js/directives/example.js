'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function exampleDirective() {

  return {
    restrict: 'EA',
    link: function(scope, element) {
      element.on('click', function() {
        console.log('element clicked');
      });
    }
  };

}

function pageHeader() {
    return {
        restrict: 'A',
        templateUrl: 'header.html'
    };
}

function routeLoadingIndicator ($rootScope, $timeout) {
    return {
        restrict: 'E',
        replace: true,
        link: function(scope, elem, attrs) {
            scope.isRouteLoading = false;

            scope.$on('httpStart', function(event) {
                scope.isRouteLoading = true;
            });
            scope.$on('httpEnd', function(event) {
                scope.isRouteLoading = false;
            });

        },
        templateUrl: "loadingSpinner.html",
    };
}

function itemBox() {
    return {
        restrict: 'E',
        replace: true,
        link: function(scope, element, attrs) {
        },
        templateUrl: 'item-box.html',
    };
}

function likeIcon($http) {
    return {
        restrict: 'E',
        scope: {
            item: '=',
        },
        replace: true,
        link: function(scope, elem, attrs) {
            scope.favor = function(item_id){
                $http.get('/api/items/favor/'+item_id).then(function(data){
                    scope.item.is_favored = true;

                });
            }
            scope.unfavor = function(item_id){
                $http.get('/api/items/unfavor/'+item_id).then(function(data){
                    scope.item.is_favored = false;
                })
            }

        },
        templateUrl: 'like-icon.html',
    };
}

function alertDialog($timeout){
    return {
        restrict: 'E',
        replace: true,
        link: function(scope, element, attrs) {
            scope.show = false;

            scope.$on('alertStart', function(event, msg) {
                scope.message = msg;
                scope.show = true;
            });
            scope.$on('alertEnd', function(event) {
                scope.show = false;
            });

            scope.$on('alert', function(event, msg) {
                scope.message = msg;
                scope.show = true;
                $timeout(function(){
                    scope.show = false;
                }, 1000);
            });

            scope.$on('ngCart:change', function(event, msg) {
                scope.message = msg;
                scope.show = true;
                $timeout(function(){
                    scope.show = false;
                }, 1000);
            });
        },
        templateUrl: 'alertDialog.html',
    }
}

function specsDialog($http, $timeout) {
    return {
        restrict: 'E',
        scope: {
            item: '=',
            onClose: '&?',
            btn: '@'
        },
        replace: true,
        link: function(scope, element, attrs) {
            scope.specsBoxShown = false;
            scope.modalShown = false;
            scope.specsBox = function(item_id) {
                scope.specsBoxShown = true;
                $timeout(function(){
                    scope.modalShown = true;
                }, 100);
                $http.get('/api/items/'+scope.item.item_id).then(function(data) {
                    scope.selectedItem = data.item;
                    scope.specs = data.item.specs;
                    scope.selectedSpec = scope.specs[0];

                    // 可选属性与属性列表组成的字典
                    scope.attrChoices = {};
                    angular.forEach(scope.selectedItem.attributes_desc, function(key, value) {
                        var attrChoices = [];
                        angular.forEach(scope.specs, function(s){
                            this.push(s.attributes[value]);
                        }, attrChoices);
                        scope.attrChoices[value] = unique(attrChoices);
                    });

                });
            };
            scope.hideModal = function() {
                $timeout(function() {
                    scope.specsBoxShown = false;
                }, 500);
                scope.modalShown = false;
            };

            scope.quantity = 1;
            scope.setQuantity = function(quantity, relative) {
                var quantityInt = parseInt(quantity);
                if (quantityInt % 1 === 0){
                    if (relative === true){
                        scope.quantity  += quantityInt;
                    } else {
                        scope.quantity = quantityInt;
                    }
                    if (scope.quantity < 1) scope.quantity = 1;
                    if (scope.quantity >= 5) scope.quantity = 5;

                } else {
                    scope.quantity = 1;
                    scope.$emit('Quantity must be an integer and was defaulted to 1');
                }
            };
            scope.subTotal = function(price, quantity) {
                return parseFloat(price * quantity);
            }

            scope.selectedAttr = {};
            scope.setAttr = function(k, val) {
                scope.selectedAttr[k]= val;
                scope.selectedSpec = containsObj(scope.selectedAttr, scope.specs);
                scope.remainSpec = remainSpecs(k,val, scope.specs);
                scope.selectedSpecData = {'item': scope.selectedItem,
                    'spec': scope.selectedSpec};
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
        templateUrl: 'specs-dialog.html',
    };
}

function catePanel(FetchData, $location, pageStore){
    return {
        restrict : 'E',
        transclude: true,
        scope: {
            show: '=',
        },
        templateUrl: 'catePanel.html',
        link: function(scope, element, attrs){
            FetchData.get('/api/categories').then(function(data) {
                scope.categories= data.categories;
            });
            scope.query = '';
            scope.show = false;
            scope.hidePanel = function() {
                scope.show = false;
            };
            scope.search = function(query) {
                if (!query){
                    return ;
                }
                pageStore.setPage(0);
                $location.path('/search/'+query);
            };
            scope.goCategory = function(en){
                pageStore.setPage(0);
                $location.path('/category/'+en);
            };
        }
    };
}

function ngcartAddtocart(ngCart){
    return {
        restrict : 'E',
        scope: {
            id:'@',
            name:'@',
            quantity:'@',
            quantityMax:'@',
            price:'@',
            data:'='
        },
        transclude: true,
        templateUrl: function(element, attrs) {
            if ( typeof attrs.templateUrl == 'undefined' ) {
                return 'ngCart/addtocart.html';
            } else {
                return attrs.templateUrl;
            }
        },
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;
            scope.attrs = attrs;
            scope.inCart = function(){
                return  ngCart.getItemById(attrs.id);
            };

            if (scope.inCart()){
                scope.q = ngCart.getItemById(attrs.id).getQuantity();
            } else {
                scope.q = parseInt(scope.quantity);
            }

            scope.qtyOpt =  [];
            for (var i = 1; i <= scope.quantityMax; i++) {
                scope.qtyOpt.push(i);
            }

            scope.alertWarning = function() {
                scope.$emit('alert', '请选择有效商品');
            };
        }
    };
}

function ngcartCart(ngCart){
    return {
        restrict : 'E',
        templateUrl: function(element, attrs) {
            if ( typeof attrs.templateUrl == 'undefined' ) {
                return 'ngCart/cart.html';
            } else {
                return attrs.templateUrl;
            }
        },
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;
        }
    };
}

function ngcartSummary(ngCart){
    return {
        restrict : 'E',
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;
        },
        scope: {},
        transclude: true,
        templateUrl: function(element, attrs) {
            if ( typeof attrs.templateUrl == 'undefined' ) {
                return 'ngCart/summary.html';
            } else {
                return attrs.templateUrl;
            }
        }
    };
}

function ngcartCheckout(ngCart, fulfilmentProvider, $http, $timeout){
    return {
        restrict : 'E',
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;
            scope.checkout = function (service) {
                var wechatInfo = navigator.userAgent.match(/MicroMessenger\/([\d\.]+)/i) ;
                if( service == 'wechat' && !wechatInfo ) {
                    scope.$emit('alert', '仅支持在微信公众号内操作');
                    return
                } else if ( service == 'wechat' && wechatInfo[1] < "5.0" ) {
                    scope.$emit("alert", "仅支持微信5.0以上版本");
                    return
                }
                fulfilmentProvider.setService(service);
                fulfilmentProvider.setSettings(scope.settings);
                fulfilmentProvider.checkout()
            };

            scope.paymentBoxShown = false;
            scope.modalShown = false;
            scope.toggleBox = function() {
                scope.paymentBoxShown = true;
                $timeout(function(){
                    scope.modalShown = true;
                }, 100);
            };
            scope.hideModal = function() {
                $timeout(function() {
                    scope.paymentBoxShown = false;
                }, 500);
                scope.modalShown = false;
            };
        },
        scope: {
            settings:'=',
            show: '=',
        },
        replace: true,
        templateUrl: function(element, attrs) {
            if ( typeof attrs.templateUrl == 'undefined' ) {
                return 'ngCart/checkout.html';
            } else {
                return attrs.templateUrl;
            }
        }
    };
}



directivesModule.directive('pageHeader', pageHeader);
directivesModule.directive('routeLoadingIndicator', routeLoadingIndicator);
directivesModule.directive('itemBox', itemBox);
directivesModule.directive('likeIcon', likeIcon);
directivesModule.directive('alertDialog', alertDialog);
directivesModule.directive('specsDialog', specsDialog);
directivesModule.directive('catePanel', catePanel);
directivesModule.directive('ngcartAddtocart', ngcartAddtocart);
directivesModule.directive('ngcartCart', ngcartCart);
directivesModule.directive('ngcartSummary', ngcartSummary);
directivesModule.directive('ngcartCheckout', ngcartCheckout);
