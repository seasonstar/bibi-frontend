'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function ExampleCtrl() {

  // ViewModel
  var vm = this;

  vm.title = 'AngularJS, Gulp, and Browserify!';
  vm.number = 1234;

}

function bodyCtrl($scope, $route, $location, $window) {
    //Body控制器
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
}

function headerCtrl($scope, $route, AppSettings) {
    //页面标题栏
}


function mainCtrl(FetchData, $location, $window, $scope, userInfo) {
    //首页
    FetchData.get('/api/banners').then(function(data) {
        $scope.banners = data.banners;
    });
    $scope.redirectTo = function(banner) {
        if (banner.type == 'BOARD') {
            $location.path('/board/'+banner.target);
        } else {
            $window.location.href = banner.target;
        }
    };
    $scope.cateShown = false;
    $scope.toggleCatePanel = function () {
        console.log($scope.cateShown);
        $scope.cateShown = !$scope.cateShown;
    }
}

function loginCtrl($scope, FetchData, $location, $window, AuthService) {

    //登陆
    FetchData.get('/api/auth/oauth/links').then(function(data){
        $scope.links = data.links;

    });

    $scope.go = function(link) {
        var wechatInfo = navigator.userAgent.match(/MicroMessenger\/([\d\.]+)/i) ;
        if( link[1] == 'wechat' && !wechatInfo ) {
            alert("仅支持在微信内登陆") ;
            $scope.$emit("alert", "仅支持在微信内登陆");
        } else {
            $window.location.href = link[0];
        }
    };

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
                $scope.disabled = false;
                $scope.loginForm = {};
            })
    };
}

function fogotPWCtrl($scope, $rootScope, AuthService){
    $scope.error = false;
    $scope.fogotPW = function () {
        AuthService.forgotPW($scope.fogotPWForm.email)
            .then(function () {
                $rootScope.$broadcast('forgotPWModal:hide');
                $scope.$emit('alert', "邮件已发送至您的邮箱");
            }).catch(function (data) {
                if (data) {
                    $scope.$emit('alert', data.error);
                } else {
                    $scope.$emit('alert', 'Something went wrong..');
                }
            });
    }
}

function accountCtrl($scope, $route, userInfo) {
    //个人页面
    $scope.user = userInfo.getUserInfo();
}

function oauthCtrl($scope, $location, $routeParams, AuthService) {
    //第三方登陆
    var sitename = $routeParams.sitename;
    var code = $location.search().code;
    AuthService.oauth(sitename, code);

}

function bindEmailCtrl($scope, $location, $routeParams, AuthService) {
    //绑定email页面
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
                $scope.disabled = false;
                $scope.loginForm = {};
            })
    };

}

function logoutCtrl($scope, $location, AuthService) {
    //登出
    $scope.logout = function () {
        AuthService.logout()
            .then(function () {
                $location.path('/login');
            });
    };
}

function paymentSuccessCtrl($location, $timeout) {
    var order_id = $location.search().order_id;
    var order_type = $location.search().order_type;
    $timeout(function(){
        $location.url($location.path());
        if (order_type == 'TRANSFER'){
            $location.path('/order/transfer/'+order_id);
        } else {
            $location.path('/orders');
        }
    }, 2000);

}

function paymentCancelCtrl() {

}

function registerCtrl($scope, $location, AuthService) {
    //注册
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

}

function itemCtrl($scope, $routeParams, FetchData) {
    //商品详情
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
}

function boardCtrl($scope, $routeParams, FetchData) {
    //专题详情
    FetchData.get('/api/board/'+ $routeParams.boardID).then(function(data) {
        $scope.board = data.board;
        $scope.images = [{url: $scope.board.image}];
    });
}

function itemsCtrl($scope, $routeParams, FetchData) {
    //商品列表
    $scope.params = {
        'sub_category': $routeParams.cate
    };
    $scope.cateShown = false;
    $scope.toggleCatePanel = function () {
        console.log($scope.cateShown);
        $scope.cateShown = !$scope.cateShown;
    }
}

function searchCtrl($scope, $routeParams, FetchData) {
    //商品列表
    $scope.params = {
        'title': $routeParams.keyword
    };
    $scope.cateShown = false;
    $scope.toggleCatePanel = function () {
        console.log($scope.cateShown);
        $scope.cateShown = !$scope.cateShown;
    }
}



function favorCtrl($scope, FetchData) {
    //我的喜欢
    FetchData.get('/api/items/favors').then(function(data) {
        $scope.items = data.items;
    });
}

function ordersCtrl($scope, FetchData, $window, ngCart) {
    //订单列表
    $scope.ngCart = ngCart;
    $scope.orderType = 'COMMODITIES';
    FetchData.get('/api/orders/COMMODITIES').then(function(data) {
        $scope.orders = data.orders;
    });
    $scope.setType = function(type) {
        $scope.orderType = type;
        FetchData.get('/api/orders/'+type).then(function(data) {
            $scope.orders = data.orders;
        });
    };
}

function orderDetailCtrl($scope, $location, $routeParams, FetchData, ngCart) {
    //商品详情
    FetchData.get('/api/orders/get/'+ $routeParams.order_id).then(function(data) {
        console.log(data);
        $scope.ngCart = ngCart;
        $scope.order = data.order;
    });

    $scope.cancelOrder = function() {
        window.confirm('确定取消订单？')?
            FetchData.get('/api/orders/'+ $routeParams.order_id + '/delete').then(function(data) {
                $scope.$emit("alert", "订单已删除");
                $location.path('/orders');
            }) : void(0);
    }
}

function logisticsDetailCtrl($scope, $window, $location,$routeParams, FetchData, ngCart) {
    //商品详情
    $scope.allStatus= [];
    FetchData.get('/api/orders/get/'+ $routeParams.order_id).then(function(data) {
        console.log(data);
        $scope.ngCart = ngCart;
        $scope.order = data.order;
        $scope.logistic = data.order.logistics[0];
        angular.forEach($scope.logistic.all_status, function (status, index) {
            $scope.allStatus.push(status.status);
        });
    });

    $scope.currTab = 0;
    $scope.goTab = function(index, lo) {
        $scope.currTab = index;
        $scope.logistic = lo;
        angular.forEach($scope.logistic.all_status, function (status, index) {
            $scope.allStatus.push(status.status);
        });

    }

    $scope.addr = ngCart.getAddress();
    $scope.gotoAddress = function(){
        $location.path('/address');
    };
    $scope.fillTracking = function(entry) {
        console.log(entry);
        FetchData.post('/api/orders/fill_shipping_info', {
            'entry_id': entry.id,
            'shipping_info': entry.shipping_info,
        }).then(function(data) {
            $scope.$emit("alert", "成功提交");
        });
    };
    // provider actions
    $scope.selectedProvider = null;
    $scope.providersShown = false;

    $scope.showProviderChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        $scope.providersShown = !$scope.providersShown;
        FetchData.post('/api/logistic/transfer_provider_prices', {
            'order_id': $scope.order.id,
            'country': ngCart.getAddress().data.country,
        }).then(function(data) {
            console.log(data);
            $scope.provider_prices = data.logistics.providers;
            $scope.selectedProvider = data.logistics.providers[0];
        });
    };

    $scope.selectPartner = function(provider){
        $scope.selectedProvider = provider;
        $scope.providersShown = !$scope.providersShown;

        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order;
        });
    };

    // coupon actions
    $scope.coupon_codes = '';
    $scope.couponsShown = false;
    $scope.couponInputSelected= false;
    $scope.noCouponSelected= false;

    $scope.showCouponsChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        if ($scope.selectedProvider == null){
            $scope.$emit('alert', "请先选择运输方式");
            return ;
        }
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/users/coupons/by_order', {
            'order_id': $scope.order.id,
        }).then(function(data) {
            $scope.availableCoupons= data.consumable_coupons;
            $scope.coupon_codes = '';
        });

    };
    $scope.noCoupon = function() {
        $scope.coupon_codes = '';
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= true;
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order;
        });
    };
    $scope.selectCoupon = function(coupon) {
        $scope.coupon_codes = coupon;
        $scope.couponsShown = !$scope.couponsShown;
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= false;
        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order;
        });
    };
    $scope.selectInputCoupon = function() {
        $scope.coupon_codes = '';
        $scope.couponInputSelected= true;
        $scope.noCouponSelected= false;
    };

    $scope.confirmCoupon = function() {
        $scope.couponInputSelected= true;
        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.couponInput],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.coupon_codes = {
                code: $scope.couponInput,
                description: $scope.couponInput,
            };
            if (data.order.discount.length === 0){
                $scope.coupon_codes['saving'] = "无效折扣码";
            } else {
                $scope.coupon_codes['saving'] = data.order.discount[0].value;
                $scope.couponsShown = !$scope.couponsShown;
            };
            $scope.order = data.order;
        }).catch(function() {
            $scope.$emit("alert", "something wrong..");
        });
    };

    $scope.cancelOrder = function() {
        window.confirm('确定取消订单？')?
            FetchData.get('/api/orders/'+ $scope.order.id + '/delete').then(function(data) {
                $scope.$emit("alert", "订单已删除");
                $location.path('/orders');
            }) : void(0);
    };

}

function calculateCtrl($scope, $location, FetchData) {
    FetchData.get('/api/address/hierarchy').then(function(data){
        $scope.COUNTRIES= data.countries;
    });
    $scope.query = {};

    $scope.queryFee = function(){
        if ($scope.queryForm.$invalid){
            $scope.$emit("alert", "请填写完整信息");
            return ;
        }
        FetchData.get('/api/logistic/cal_provider_prices', {
            'country': $scope.query.country,
            'weight': $scope.query.weight,
        }).then(function(data) {
            console.log(data);
            $scope.provider_prices = data.logistics.providers;
        });
    };
}

function expressCtrl($scope, $location, FetchData, ngCart, AuthService) {
    //待寄物品清单
    $scope.ngCart = ngCart;
    $scope.STATUES = ['跟踪快递', '入库称重', '支付运费', '正在运送', '航班到港', '包裹签收'];

    $scope.addr = ngCart.getAddress();
    $scope.gotoAddress = function(){
        $location.path('/address');
    };

    $scope.entries = [];
    $scope.newEntry = {};
    $scope.addEntry = function(newEntry) {
        if (!newEntry.title || !newEntry.quantity || !newEntry.amount || !newEntry.remark) {
            $scope.$emit('alert', "请填写完整信息");
            return
        }
        if (newEntry.main_category == true) {
            newEntry.main_category = 'special';
        } else {
            newEntry.main_category = 'normal';
        }
        $scope.entries.push(newEntry);
        $scope.newEntry = {};
    };
    $scope.removeEntry = function(entry) {
        angular.forEach($scope.entries, function(ent, index) {
            if  (ent === entry) {
                $scope.entries.splice(index, 1);
            }
        });
    };
    $scope.submit = function(){
        if ($scope.entries.length == 0){
            $scope.$emit('alert', "您未添加商品");
            return ;
        }
        if (AuthService.isLoggedIn() === false) {
            var token = AuthService.getToken();
            if (token) {
                AuthService.authenticate(token)
                    .then(function() {

                    }).catch(function() {
                        AuthService.setToken('');
                    })
            } else {
                $location.path('/login');
            }
        }
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请添加地址");
            return ;
        }

        $scope.$emit("alertStart", "正在处理，请稍等..");
        FetchData.post('/api/orders/create_transfer_order', {
            'entries': $scope.entries,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [],
            'logistic_provider': 'default',
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order;
            $scope.$emit("alertEnd");
            $location.path('/order/transfer/'+data.order_id);
        }).catch(function(){
            $scope.$emit("alert","系统出错..");
        });

    }
}


function cartCtrl(FetchData, $scope, ngCart) {
    //购物车
    FetchData.get('/api/cart').then(function(data) {
        ngCart.$loadCart(data.cart);
    });
    $scope.ngCart = ngCart;
    $scope.editShown = false;
    $scope.toggleEditShown = function() {
        $scope.editShown = !$scope.editShown;
    };
    $scope.setQuantity = function(item, quantity, relative) {
        var quantityInt = parseInt(quantity);
        if (quantityInt % 1 === 0){
            if (relative === true){
                item.setQuantity(item.getQuantity() + quantityInt)
            } else {
                item.setQuantity(quantityInt)
            }
            if (item.getQuantity() < 1) item.setQuantity(1);
            if (item.getQuantity() >= 5) item.setQuantity(5);

        } else {
            item.setQuantity(1)
            $scope.$emit('Quantity must be an integer and was defaulted to 1');
        }
        console.log(item.getQuantity());
        FetchData.post('/api/cart/entry/'+item.getId()+'/update', {
            'quantity': item.getQuantity()
        });
    };


    $scope.selectEntry = function(id) {
        if (ngCart.getSelectedItemById(id)) {
            ngCart.removeSelectedItemById(id);
        } else {
            ngCart.selectItem(id);
        }
    };

    $scope.isSelectedAll = false;
    $scope.selectAllEntries = function() {
        if ($scope.isSelectedAll === false) {
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

}

function checkoutCtrl($location, $scope, FetchData, ngCart) {
    // 结算
    $scope.ngCart = ngCart;
    $scope.addr = ngCart.getAddress();

    $scope.gotoAddress = function(){
        $location.path('/address');
    };


    // provider actions
    $scope.selectedProvider = null;
    $scope.providersShown = false;

    $scope.showProviderChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        $scope.providersShown = !$scope.providersShown;
        FetchData.post('/api/logistic/channel_prices', {
            'entries': ngCart.selectedItemsObjects(),
            'country': $scope.addr.data.country,
        }).then(function(data) {
            console.log(data);
            $scope.provider_prices = data.logistics.providers;
            $scope.selectedProvider = data.logistics.providers[0];
        });
    };

    $scope.selectPartner = function(provider){
        $scope.selectedProvider = provider;
        $scope.providersShown = !$scope.providersShown;

        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order;
        });
    };

    // coupon actions
    $scope.coupon_codes = '';
    $scope.couponsShown = false;
    $scope.couponInputSelected= false;
    $scope.noCouponSelected= false;
    $scope.showCouponsChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        if ($scope.selectedProvider == null){
            $scope.$emit('alert', "请先选择运输方式");
            return ;
        }
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/users/coupons/by_entries', {
            'entries': ngCart.selectedItemsObjects(),
        }).then(function(data) {
            $scope.availableCoupons= data.consumable_coupons;
            $scope.coupon_codes = '';
        });
    };
    $scope.noCoupon = function() {
        $scope.coupon_codes = '';
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= true;
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order;
        });
    };
    $scope.selectCoupon = function(coupon) {
        $scope.coupon_codes = coupon;
        $scope.couponsShown = !$scope.couponsShown;
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= false;
        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.order = data.order;
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
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.couponInput],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            console.log(data);
            $scope.coupon_codes = {
                code: $scope.couponInput,
                description: $scope.couponInput,
            };
            if (data.order.discount.length === 0){
                $scope.coupon_codes['saving'] = "无效折扣码";
            } else {
                $scope.coupon_codes['saving'] = data.order.discount[0].value;
                $scope.couponsShown = !$scope.couponsShown;
            };
            $scope.order = data.order;

        }).catch(function() {
            $scope.$emit("alert", "something wrong..");
        });
    };
}

function addressFormCtrl($window, $routeParams, $scope, FetchData, ngCart) {
    // 添加地址
    $scope.addr = {};
    var addr_id = $routeParams.addr_id;
    if (addr_id) {
        FetchData.get('/api/address/get/'+addr_id).then(function(data){
            $scope.addr= data.address;
        });
    }
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
            $scope.$emit("alert", "请填写完整信息");
            return ;
        }
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
            });
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
            });

        }
    };
}

function addressCtrl($window, $location, $scope, FetchData, ngCart) {
    // 地址选择
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
                $scope.$emit("alert", data.error);
            }
        });
    };

    $scope.ngCart = ngCart;
    $scope.selectedAddress = '';
    $scope.selectAddress = function(address){
        $scope.selectedAddress = address;
        console.log($scope.selectedAddress);
    };
    $scope.confirmAddress = function(){
        ngCart.setAddress($scope.selectedAddress);
        //$location.path('/checkout');
        $window.history.back();

    };
    $scope.goAdd = function() {
        $location.path('/address/add');
    };
    $scope.saveAddress = function(){
        if ($scope.addressForm.$invalid){
            $scope.$emit("alert", "请填写完整信息");
            return ;
        }
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

        });
    };
}

function fourZeroFour_controller() {}

function feedbackCtrl($scope, FetchData) {
    $scope.feedback = function() {
        FetchData.post('/api/users/feedback', {
            'feedback': $scope.text,
        }).then(function(data) {
            alert("感谢您的反馈，我们会及时与您联系。")
        })
    };
}

function csCtrl($scope) {
}

//controllersModule.controller('ExampleCtrl', ExampleCtrl);
controllersModule.controller('bodyCtrl', bodyCtrl);
controllersModule.controller('headerCtrl', headerCtrl);
controllersModule.controller('feedbackCtrl', feedbackCtrl);
controllersModule.controller('csCtrl', csCtrl);
controllersModule.controller('mainCtrl', mainCtrl);
controllersModule.controller('loginCtrl', loginCtrl);
controllersModule.controller('fogotPWCtrl', fogotPWCtrl);
controllersModule.controller('accountCtrl', accountCtrl);
controllersModule.controller('oauthCtrl', oauthCtrl);
controllersModule.controller('bindEmailCtrl', bindEmailCtrl);
controllersModule.controller('logoutCtrl', logoutCtrl);
controllersModule.controller('paymentSuccessCtrl', paymentSuccessCtrl);
controllersModule.controller('paymentCancelCtrl', paymentCancelCtrl);
controllersModule.controller('registerCtrl', registerCtrl);
controllersModule.controller('itemCtrl', itemCtrl);
controllersModule.controller('itemsCtrl', itemsCtrl);
controllersModule.controller('searchCtrl', searchCtrl);
controllersModule.controller('boardCtrl', boardCtrl);
controllersModule.controller('favorCtrl', favorCtrl);
controllersModule.controller('ordersCtrl', ordersCtrl);
controllersModule.controller('calculateCtrl', calculateCtrl);
controllersModule.controller('expressCtrl', expressCtrl);
controllersModule.controller('orderDetailCtrl', orderDetailCtrl);
controllersModule.controller('logisticsDetailCtrl', logisticsDetailCtrl);
controllersModule.controller('cartCtrl', cartCtrl);
controllersModule.controller('checkoutCtrl', checkoutCtrl);
controllersModule.controller('addressFormCtrl', addressFormCtrl);
controllersModule.controller('addressCtrl', addressCtrl);
controllersModule.controller('fourZeroFour_controller', fourZeroFour_controller);
