define(['angular'], function (angular) {

    var appControllers = angular.module('maybi.controllers', ['ngRoute', 'ngCookies', 'angular-carousel', 'ngTouch']);

    //Body控制器
    appControllers.controller('bodyCtrl', ['$scope', '$route', '$location', '$window', function ($scope, $route, $location, $window) {
        $scope.header_l_handler = function (href) {
            console.log('header_l_handler() ', href);
            if (href === '') {
                return false;
            } else if (href == "back") {
                return $window.history.back();
            } else {
                console.log('header_l_handler go to ', href);
                $location.path(href);
            }
        };
        $scope.header_r_handler = function (href, evt_name) {
            console.log('header_r_handler() ', href, evt_name);
            if (href === '') {
                return false;
            } else {
                console.log('header_r_handler go to ', href);
                $location.path(href);
            }
        };
    }]);

    //页面标题栏
    appControllers.controller('headerCtrl', ['$scope', '$route', 'authHttpResponseInterceptor', function ($scope, $route, authHttpResponseInterceptor) {
        var l_btn = $route.current.header_left_button || 'default';
        var r_btn = $route.current.header_right_button || 'default';
        $scope.l_btn = authHttpResponseInterceptor.header_left_buttons[l_btn];
        $scope.r_btn = authHttpResponseInterceptor.header_right_buttons[r_btn];
        $scope.getPageTitle = $route.current.page_title;
        $scope.$on('$routeChangeSuccess', function () {
            //console.log($route.current.originalPath.trim());
            var l_btn = $route.current.header_left_button || 'default';
            var r_btn = $route.current.header_right_button || 'default';
            $scope.l_btn = authHttpResponseInterceptor.header_left_buttons[l_btn];
            $scope.r_btn = authHttpResponseInterceptor.header_right_buttons[r_btn];
            $scope.getPageTitle = $route.current.page_title;
        });
    }]);

    //首页
    appControllers.controller('mainCtrl', ['FetchData', '$location', '$window', '$scope', 'userInfo', function (FetchData, $location, $window, $scope, userInfo) {
        FetchData.get('/api/items').then(function(data) {
            $scope.items = data.items;
        });
        FetchData.get('/api/banners').then(function(data) {
            $scope.banners = data.banners;
        });
        $scope.redirectTo = function(banner) {
            if (banner.type == 'BOARD') {
                $location.path('/board/'+banner.target)
            } else {
                $window.location.href = banner.target;
            }

        };
    }]);

    //登陆
    appControllers.controller('loginCtrl', ['$scope', 'FetchData', '$location', 'AuthService', function ($scope, FetchData, $location, AuthService) {

        console.log(AuthService.isLoggedIn());
        FetchData.get('/api/auth/oauth/links').then(function(data){
            $scope.links = data.links;

        });

        $scope.login = function () {
            $scope.error = false;
            $scope.disabled = true;

            AuthService.login($scope.loginForm.email, $scope.loginForm.password)
                .then(function() {
                    $location.path('/');
                    $scope.disabled = false;
                    $scope.loginForm = {};
                }).catch(function () {
                    $scope.error = true;
                    $scope.errorMessage = "Invalid username and/or password";
                    $scope.disabled = false
                    $scope.loginForm = {};
                })
        }
    }]);

    //个人页面
    appControllers.controller('accountCtrl', ['$scope', '$route', 'userInfo', function ($scope, $route, userInfo) {
        $scope.user = userInfo.getUserInfo();
    }]);

    appControllers.controller('oauthCtrl', ['$scope', '$location', '$routeParams', 'AuthService', function ($scope, $location, $routeParams, AuthService) {
        var sitename = $routeParams.sitename;
        var code = $location.search().code;
        AuthService.oauth(sitename, code);

    }]);

    //绑定email页面
    appControllers.controller('bindEmailCtrl', ['$scope', '$location', '$routeParams', 'AuthService', function ($scope, $location, $routeParams, AuthService) {
        $scope.bind = function () {
            $scope.error = false;
            $scope.disabled = true;

            AuthService.bindEmail($scope.loginForm.email, $routeParams.user_id)
                .then(function() {
                    $location.path('/account');
                    $scope.disabled = false;
                    $scope.loginForm = {};
                }).catch(function () {
                    $scope.error = true;
                    $scope.errorMessage = "邮箱已存在";
                    $scope.disabled = false
                    $scope.loginForm = {};
                })
        }

    }]);

    //登出
    appControllers.controller('logoutCtrl', ['$scope', '$location', 'AuthService', function ($scope, $location, AuthService) {
        $scope.logout = function () {
            AuthService.logout()
                .then(function () {
                    $location.path('/login');
                });
        };
    }]);

    appControllers.controller('paymentSuccessCtrl', ['$scope', '$location', 'AuthService', function ($scope, $location, AuthService) {

    }]);
    appControllers.controller('paymentCancelCtrl', ['$scope', '$location', 'AuthService', function ($scope, $location, AuthService) {

    }]);

    //注册
    appControllers.controller('registerCtrl', ['$scope', '$location', 'AuthService', function ($scope, $location, AuthService) {

        $scope.register = function () {

            $scope.error = false;
            $scope.disabled = true;

            // call register from service
            AuthService.register($scope.registerForm)
                // handle success
                .then(function () {
                    $location.path('/');
                    $scope.disabled = false;
                    $scope.registerForm = {};
                })
                .catch(function () {
                    $scope.error = true;
                    $scope.errorMessage = "Something went wrong!";
                    $scope.disabled = false;
                    $scope.registerForm = {};
                });
        };

    }]);

    //商品详情
    appControllers.controller('itemCtrl', ['$scope', '$routeParams', 'FetchData', function ($scope, $routeParams, FetchData) {
        FetchData.get('/api/items/'+ $routeParams.itemID).then(function(data) {
            $scope.item = data.item;
            $scope.selectedSpec = $scope.item.specs[0];
            var images = [];
            angular.forEach($scope.item.specs, function (spec, index) {
                angular.forEach(spec.images, function (img, i) {
                    images.push({url: img});
                });
            });
            $scope.images = images;
        });
    }]);

    //专题详情
    appControllers.controller('boardCtrl', ['$scope', '$routeParams', 'FetchData', function ($scope, $routeParams, FetchData) {
        FetchData.get('/api/board/'+ $routeParams.boardID).then(function(data) {
            $scope.board = data.board;
            $scope.images = [{url: $scope.board.image}];
        });
    }]);

    //我的喜欢
    appControllers.controller('favorCtrl', ['$scope', 'FetchData', function ($scope,FetchData) {
        FetchData.get('/api/items/favors').then(function(data) {
            $scope.items = data.items;
        });
    }]);

    //订单列表
    appControllers.controller('ordersCtrl', ['$scope', 'FetchData', '$window', 'ngCart', function ($scope, FetchData, $window, ngCart) {
        $scope.ngCart = ngCart;
        FetchData.get('/api/orders/all').then(function(data) {
            $scope.orders = data.orders;
        });
        $scope.goCheckout = function(order_id){
            FetchData.post('/api/payment/checkout/'+order_id, {
                'payment_method': 'paypal'
            }).then(function(data) {
                $window.location.href = data.url;
            })
        }
    }]);

    //购物车
    appControllers.controller('cartCtrl', ['FetchData', '$scope', 'ngCart', function (FetchData, $scope, ngCart) {
        FetchData.get('/api/cart').then(function(data) {
            ngCart.$loadCart(data.cart);
        });
        $scope.ngCart = ngCart;
        $scope.items= ngCart.getCart().items;
        $scope.editShown = false;
        $scope.toggleEditShown = function() {
            $scope.editShown = !$scope.editShown;
        };

        $scope.selectEntry = function(id) {
            if (ngCart.getSelectedItemById(id)) {
                ngCart.removeSelectedItemById(id);
            } else {
                ngCart.selectItem(id)
            }
        };

        $scope.isSelectedAll = false;
        $scope.selectAllEntries = function() {
            if ($scope.isSelectedAll == false) {
                angular.forEach(ngCart.getCart().items, function (item, index) {
                    if (!ngCart.getSelectedItemById(item.getId())) {
                        ngCart.selectItem(item.getId());
                    }
                });
            } else {
                ngCart.getCart().selectedItems = [];
            }
            $scope.isSelectedAll = !$scope.isSelectedAll;
        };

    }]);

    // 结算
    appControllers.controller('checkoutCtrl', ['$location', '$scope', 'FetchData', 'ngCart', function ($location, $scope, FetchData, ngCart) {
        $scope.ngCart = ngCart;
        $scope.addr = ngCart.getAddress();

        $scope.gotoAddress = function(){
            $location.path('/address');
        };

        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order
        });

        $scope.coupon_codes = '';
        FetchData.post('/api/users/coupons/by_entries', {
            'entries': ngCart.selectedItemsObjects(),
        }).then(function(data) {
            $scope.availableCoupons= data.consumable_coupons;
            $scope.coupon_codes = '';
        });

        $scope.selectedProvider = [];
        FetchData.post('/api/logistic/provider_prices', {
            'entries': ngCart.selectedItemsObjects(),
        }).then(function(data) {
            console.log(data);
            $scope.provider_prices = data.logistics.providers;
            $scope.selectedProvider = data.logistics.providers[0];
        });

        // provider actions
        $scope.providersShown = false;
        $scope.showProviderChoices = function() {
            $scope.providersShown = !$scope.providersShown;
        };
        $scope.selectPartner = function(provider){
            $scope.selectedProvider = provider;
            $scope.providersShown = !$scope.providersShown;

            FetchData.post('/api/orders/cal_entries_price', {
                'entries': ngCart.selectedItemsObjects(),
                'coupon_codes': [$scope.coupon_codes.code],
                'logistic_provider': $scope.selectedProvider.name,
            }).then(function(data) {
                console.log(data);
                $scope.order = data.order
            });
        };

        // coupon actions
        $scope.couponsShown = false;
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= false;
        $scope.showCouponsChoices = function() {
            $scope.couponsShown = !$scope.couponsShown;
        };
        $scope.noCoupon = function() {
            $scope.coupon_codes = '';
            $scope.couponInputSelected= false;
            $scope.noCouponSelected= true;
            $scope.couponsShown = !$scope.couponsShown;
            FetchData.post('/api/orders/cal_entries_price', {
                'entries': ngCart.selectedItemsObjects(),
                'coupon_codes': [],
                'logistic_provider': $scope.selectedProvider.name,
            }).then(function(data) {
                console.log(data);
                $scope.order = data.order
            });
        };
        $scope.selectCoupon = function(coupon) {
            $scope.coupon_codes = coupon;
            $scope.couponsShown = !$scope.couponsShown;
            $scope.couponInputSelected= false;
            $scope.noCouponSelected= false;
            FetchData.post('/api/orders/cal_entries_price', {
                'entries': ngCart.selectedItemsObjects(),
                'coupon_codes': [$scope.coupon_codes.code],
                'logistic_provider': $scope.selectedProvider.name,
            }).then(function(data) {
                console.log(data);
                $scope.order = data.order
            });
        };
        $scope.selectInputCoupon = function() {
            $scope.coupon_codes = '';
            $scope.couponInputSelected= true;
            $scope.noCouponSelected= false;
        };

        $scope.confirmCoupon = function() {
            $scope.couponInputSelected= true;
            FetchData.post('/api/orders/cal_entries_price', {
                'entries': ngCart.selectedItemsObjects(),
                'coupon_codes': [$scope.couponInput],
                'logistic_provider': $scope.selectedProvider.name,
            }).then(function(data) {
                console.log(data);
                $scope.coupon_codes = {
                    code: $scope.couponInput,
                    description: $scope.couponInput,
                };
                if (data.order.discount.length == 0){
                    $scope.coupon_codes['saving'] = "无效折扣码"
                } else {
                    $scope.coupon_codes['saving'] = data.order.discount[0].value
                };
                $scope.order = data.order
            });

        }

    }]);

    // 添加地址
    appControllers.controller('addressFormCtrl', ['$window', '$routeParams', '$scope', 'FetchData', 'ngCart', function ($window, $routeParams, $scope, FetchData, ngCart) {
        $scope.addr = {};
        var addr_id = $routeParams.addr_id;
        if (addr_id) {
            FetchData.get('/api/address/get/'+addr_id).then(function(data){
                $scope.addr= data.address;
            });
        };
        FetchData.get('/api/address/hierarchy').then(function(data){
            $scope.COUNTRIES= data.countries;
        });
        $scope.$watch('addr["country"]', function(new_val) {
            FetchData.get('/api/address/hierarchy/'+$scope.addr.country).then(function(data) {
                $scope.REGIONS= data.regions;
            });
        });

        $scope.ngCart = ngCart;
        $scope.saveAddress = function(){
            if ($scope.addressForm.$invalid){
                alert("请填写完整信息");
                return
            };
            if (addr_id) {
                FetchData.post('/api/address/update/'+addr_id, {
                    'receiver': $scope.addr.receiver,
                    'street1': $scope.addr.street1,
                    'street2': $scope.addr.street2,
                    'city': $scope.addr.city,
                    'state': $scope.addr.state,
                    'postcode': $scope.addr.postcode,
                    'country': $scope.addr.country,
                    'mobile_number': $scope.addr.mobile_number,
                }).then(function(data) {
                    console.log(data);
                    $window.history.back();
                })
            } else {
                FetchData.post('/api/address/add', {
                    'receiver': $scope.addr.receiver,
                    'street1': $scope.addr.street1,
                    'street2': $scope.addr.street2,
                    'city': $scope.addr.city,
                    'state': $scope.addr.state,
                    'postcode': $scope.addr.postcode,
                    'country': $scope.addr.country,
                    'mobile_number': $scope.addr.mobile_number,
                }).then(function(data) {
                    console.log(data);
                    $window.history.back();
                })

            }
        };
    }]);

    // 地址选择
    appControllers.controller('addressCtrl', ['$window', '$location', '$scope', 'FetchData', 'ngCart', function ($window, $location, $scope, FetchData, ngCart) {
        FetchData.get('/api/address/all').then(function(data){
            $scope.addresses = data.addresses;
        });

        $scope.editShown = false;
        $scope.toggleEditShown = function() {
            $scope.editShown = !$scope.editShown;
        };
        $scope.removeAddr = function(addr_id) {
            FetchData.get('/api/address/del/'+addr_id).then(function(data){
                if(data.message == 'OK') {
                    angular.forEach($scope.addresses, function (addr, index) {
                        if  (addr.id === addr_id) {
                            $scope.addresses.splice(index, 1);
                        }
                    });
                } else {
                    alert(data.error);
                }
            });
        }

        $scope.ngCart = ngCart;
        $scope.selectedAddress = '';
        $scope.selectAddress = function(address){
            $scope.selectedAddress = address;
            console.log($scope.selectedAddress);
        };
        $scope.confirmAddress = function(){
            ngCart.setAddress($scope.selectedAddress);
            $location.path('/checkout');
        };
        $scope.goAdd = function() {
            $location.path('/address/add');
        };
        $scope.saveAddress = function(){
            if ($scope.addressForm.$invalid){
                alert("请填写完整信息");
                return
            };
            FetchData.post('/api/address/add', {
                'receiver': $scope.receiver,
                'street1': $scope.street1,
                'street2': $scope.street2,
                'city': $scope.city,
                'state': $scope.state,
                'postcode': $scope.postcode,
                'country': $scope.country,
                'mobile_number': $scope.mobile_number,

            }).then(function(data) {
                console.log(data);
                $window.history.back();

            })
        };
    }]);

    // 404
    appControllers.controller('fourZeroFour_controller', [function () {}]);

    return appControllers;

});
