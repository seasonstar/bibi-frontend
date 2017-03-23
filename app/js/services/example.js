'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function ExampleService($q, $http) {

  var service = {};

  service.get = function() {
    var deferred = $q.defer();

    $http.get('apiPath').then(function(data) {
        deferred.resolve(data);
    }).catch(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  return service;

}

function userInfo($http, $cookies) {
    var user_info = {};
    return {
        setUserInfo: function (obj) {
            user_info = obj;
        },
        getUserInfo: function () {
            return user_info;
        }
    };
}

function reverse() {
    return function(items) {
        if (!angular.isArray(items)) return false;
        return items.slice().reverse();
    };
}

function FetchData($rootScope, $http, $cookies, $location, $q) {
    return {
        get: function (url, kargs) {
            var server_url = url ;
            var d = $q.defer();
            $rootScope.$broadcast('httpStart');
            $http({
                method: "GET",
                url: server_url,
                params: kargs,

            }).then(function(res, status) {
                if (status === 200 && res.message == "OK") {
                    console.log('fetchData() success: ', res);
                    d.resolve(res);
                } else {
                    console.log('挂了');
                    console.log(res.message+': '+res.error);
                    d.reject();
                }
                $rootScope.$broadcast('httpEnd');
            }).catch(function (data){
                d.reject();
                $rootScope.$broadcast('httpEnd');
            });
            return d.promise;
        },
        post: function (url, kargs) {
            var server_url = url ;
            var d = $q.defer();
            $http({
                method: "POST",
                url: server_url,
                data: kargs

            }).then(function(res, status) {
                if (status === 200 && res.message == "OK") {
                    console.log('postData() success: ', res);
                    d.resolve(res);
                } else {
                    console.log('挂了');
                    console.log(res.message+': '+res.error);
                    d.reject();
                }
            }).catch(function (data){
                d.reject();
            });
            return d.promise;
        }
    };
}

function AuthService($http, $cookies, $location, $q, userInfo) {
    var isAuthenticated = false;
    return {
        isLoggedIn: function () {
            if (isAuthenticated) {
                return true;
            } else {
                return false;
            }
        },

        login: function (email, password) {
            var deferred = $q.defer();
            var self = this;
            $http.post('/api/auth/login_email', {
                email: email,
                password: password
            }).then(function(data, status) {
                if (status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    userInfo.setUserInfo(data.user);
                    self.setToken(data.remember_token);
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject();
                }
            }).catch(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        bindEmail: function (email, user_id) {
            var deferred = $q.defer();
            var self = this;
            $http.post('/api/auth/bind_email', {
                email: email,
                user_id: user_id,
            }).then(function(data, status) {
                if (status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    userInfo.setUserInfo(data.user);
                    self.setToken(data.remember_token);
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject();
                }
            }).catch(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        logout: function() {
            var deferred = $q.defer();
            var self = this;
            $http.get('/api/auth/logout').then(function (data) {
                isAuthenticated = false;
                userInfo.setUserInfo({});
                self.setToken('');
                deferred.resolve();
            }).catch(function (data) {
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        authenticate: function(token) {
            var deferred = $q.defer();
            var self = this;
            $http.post('/api/auth/login_with_token', {
                token: token,
            }).then(function (data, status) {
                if (status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    userInfo.setUserInfo(data.user);
                    self.setToken(data.remember_token);
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject();
                }
            }).catch(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        oauth: function(sitename,code) {
            var self = this;
            $http.get('/api/auth/oauth/'+sitename, {
                params: {code: code}
            }).then(function(data, status) {
                if (data.message == "OK" && data.login === true){
                    isAuthenticated = true;
                    userInfo.setUserInfo(data.user);
                    self.setToken(data.remember_token);
                    $location.url($location.path());
                    $location.path('/account');
                } else if(data.message == "OK" && data.login === false){
                    isAuthenticated = false;
                    $location.url($location.path());
                    $location.path('/account/bind_email/'+data.user_id);
                }
            }).catch(function (data){
                isAuthenticated = false;
            });
        },

        register: function(form) {
            var deferred = $q.defer();
            var self = this;

            $http.post('/api/auth/signup', {
                email: form.email,
                password: form.password,
                name: form.name
            }).then(function (data, status) {
                if(status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    userInfo.setUserInfo(data.user);
                    self.setToken(data.remember_token);
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject();
                }
            }).catch(function (data) {
                deferred.reject();
            });

            return deferred.promise;
        },

        setToken: function (token) {
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 31);
            $cookies.put('token', token, {
                'expires': expireDate,
            });
        },

        getToken: function () {
            return $cookies.get('token');
        },

        forgotPW: function(email){
            var deferred = $q.defer();
            var self = this;
            $http.post('/api/auth/forgot_password', {
                email: email
            }).then(function(data, status) {
                if (status === 200 && data.message == "OK"){
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject(data);
                }
            }).catch(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        }
    };
}

function ngCart($rootScope, FetchData, ngCartItem, store) {

    this.attrMap = {'size': "尺寸", 'color': "颜色", 'style': "样式"};

    this.init = function(){
        this.$cart = {
            shipping : null,
            taxRate : null,
            tax : null,
            items : [],
            selectedItems: [],
        };
        this.$addr = {
            id: undefined,
            data: {},
        };
    };

    this.setAddress = function(addr){
        this.$addr.id = addr.id;
        this.$addr.data = addr;
    };

    this.getAddress = function () {
        var _self = this;

        if (this.$addr.id === undefined) {
            FetchData.get('/api/address/default').then(function(data) {
                if (data.address) {
                    _self.setAddress(data.address);
                }
            });
        }
        return this.$addr;

    };

    this.addItem = function (id, name, price, quantity, data) {

        var _self = this;

        FetchData.post('/api/cart/add/'+ id, {
            'quantity': quantity,
        }).then(function(res) {
            _self.$loadCart(res.cart);
            console.log(res);
        });
        $rootScope.$broadcast('ngCart:change', "商品已添加到购物车");
    };

    this.selectItem = function (id) {
        // 查找cart已有的item,并加进selectedItems
        var inCart = this.getItemById(id);
        if (typeof inCart === 'object'){
            this.$cart.selectedItems.push(inCart);
        } else {
            console.log('irregular item');
        }
    };

    this.getItemById = function (itemId) {
        var items = this.getCart().items;
        var build = false;

        angular.forEach(items, function (item) {
            if  (item.getId() === itemId) {
                build = item;
            }
        });
        return build;
    };

    this.getSelectedItemById = function (itemId) {
        var items = this.getCart().selectedItems;
        var build = false;

        angular.forEach(items, function (item) {
            if  (item.getId() === itemId) {
                build = item;
            }
        });
        return build;
    };

    this.setShipping = function(shipping){
        this.$cart.shipping = shipping;
        return this.getShipping();
    };

    this.getShipping = function(){
        if (this.getCart().items.length === 0) return 0;
        return  this.getCart().shipping;
    };

    this.setTaxRate = function(taxRate){
        this.$cart.taxRate = +parseFloat(taxRate).toFixed(2);
        return this.getTaxRate();
    };

    this.getTaxRate = function(){
        return this.$cart.taxRate;
    };

    this.getTax = function(){
        return +parseFloat(((this.getSubTotal()/100) * this.getCart().taxRate )).toFixed(2);
    };

    this.setCart = function (cart) {
        this.$cart = cart;
        return this.getCart();
    };

    this.getCart = function(){
        return this.$cart;
    };

    this.getItems = function(){
        return this.getCart().items;
    };

    this.getSelectedItems = function(){
        return this.getCart().selectedItems;
    };

    this.getTotalItems = function () {
        var count = 0;
        var items = this.getItems();
        angular.forEach(items, function (item) {
            count += item.getQuantity();
        });
        return count;
    };

    this.getTotalSelectedItems = function () {
        var count = 0;
        var items = this.getSelectedItems();
        angular.forEach(items, function (item) {
            count += item.getQuantity();
        });
        return count;
    };

    this.getTotalUniqueItems = function () {
        return this.getCart().items.length;
    };

    this.getSubTotal = function(){
        var total = 0;
        angular.forEach(this.getCart().selectedItems, function (item) {
            total += item.getTotal();
        });
        return +parseFloat(total).toFixed(2);
    };

    this.totalCost = function () {
        return +parseFloat(this.getSubTotal() + this.getShipping() + this.getTax()).toFixed(2);
    };

    this.removeItemById = function (id) {
        var _self = this;
        var cart = this.getCart();
        angular.forEach(cart.items, function (item, index) {
            if  (item.getId() === id) {
                cart.items.splice(index, 1);
            }
        });
        FetchData.post('/api/cart/entry/delete', {
            'skus': [id]
        }).then(function(data){
            _self.$loadCart(res.cart);
        });

        $rootScope.$broadcast('ngCart:change', "商品已从购物车清除");
    };

    this.removeSelectedItemById = function (id) {
        var cart = this.getCart();
        angular.forEach(cart.selectedItems, function (item, index) {
            if  (item.getId() === id) {
                cart.selectedItems.splice(index, 1);
            }
        });
        this.setCart(cart);

        $rootScope.$broadcast('ngCart:change', "");
    };

    this.empty = function () {

        $rootScope.$broadcast('ngCart:change', "已成功清空购物车");
        this.$cart.items = [];
        localStorage.removeItem('cart');
    };

    this.isEmpty = function () {

        return (this.$cart.items.length > 0 ? false : true);

    };

    this.selectedItemsObjects = function() {

        if (this.getSelectedItems().length === 0) return false;

        var selectedItems = [];
        angular.forEach(this.getSelectedItems(), function(item, index){
            selectedItems.push({'item_id': item._data.item.item_id,
                                'sku': item._id,
                                'quantity': item._quantity});
        });

        return selectedItems;

    };

    this.toObject = function() {

        if (this.getSelectedItems().length === 0) return false;

        var items = [];
        angular.forEach(this.getSelectedItems(), function(item){
            items.push (item.toObject());
        });

        return {
            shipping: this.getShipping(),
            tax: this.getTax(),
            taxRate: this.getTaxRate(),
            subTotal: this.getSubTotal(),
            totalCost: this.totalCost(),
            items: items
        };
    };


    this.$restore = function(storedCart){
        var _self = this;
        _self.init();
        angular.forEach(storedCart.items, function (item) {
            _self.$cart.items.push(new ngCartItem(item._id,  item._name, item._price, item._quantity, item._data));
        });
        this.$save();
    };

    this.$loadCart = function(cart){
        var _self = this;
        _self.init();
        angular.forEach(cart, function (item) {
            _self.$cart.items.push(new ngCartItem(item.spec.sku,  item.item.title, item.unit_price, item.quantity, item));
        });
        this.$save();
    };

    this.$save = function () {
        return store.set('cart', JSON.stringify(this.getCart()));
    };

}

function ngCartItem($rootScope, $log) {

    var item = function (id, name, price, quantity, data) {
        this.setId(id);
        this.setName(name);
        this.setPrice(price);
        this.setQuantity(quantity);
        this.setData(data);
    };


    item.prototype.setId = function(id){
        if (id)  this._id = id;
        else {
            $log.error('An ID must be provided');
        }
    };

    item.prototype.getId = function(){
        return this._id;
    };


    item.prototype.setName = function(name){
        if (name)  this._name = name;
        else {
            $log.error('A name must be provided');
        }
    };
    item.prototype.getName = function(){
        return this._name;
    };

    item.prototype.setPrice = function(price){
        var priceFloat = parseFloat(price);
        if (priceFloat) {
            if (priceFloat <= 0) {
                $log.error('A price must be over 0');
            } else {
                this._price = (priceFloat);
            }
        } else {
            $log.error('A price must be provided');
        }
    };
    item.prototype.getPrice = function(){
        return this._price;
    };


    item.prototype.setQuantity = function(quantity, relative){

        var quantityInt = parseInt(quantity);
        if (quantityInt % 1 === 0){
            if (relative === true){
                this._quantity  += quantityInt;
            } else {
                this._quantity = quantityInt;
            }
            if (this._quantity < 1) this._quantity = 1;
            if (this._quantity >= 5) this._quantity = 5;

        } else {
            this._quantity = 1;
            $log.info('Quantity must be an integer and was defaulted to 1');
        }
        //$rootScope.$broadcast('ngCart:change', {});

    };

    item.prototype.getQuantity = function(){
        return this._quantity;
    };

    item.prototype.setData = function(data){
        if (data) this._data = data;
    };

    item.prototype.getData = function(){
        if (this._data) return this._data;
        else $log.info('This item has no data');
    };


    item.prototype.getTotal = function(){
        return +parseFloat(this.getQuantity() * this.getPrice()).toFixed(2);
    };

    item.prototype.toObject = function() {
        return {
            id: this.getId(),
            name: this.getName(),
            price: this.getPrice(),
            quantity: this.getQuantity(),
            data: this.getData(),
            total: this.getTotal()
        };
    };

    return item;

}

function store($window) {

    return {

        get: function (key) {
            if ($window.localStorage [key]) {
                var cart = angular.fromJson($window.localStorage [key]);
                return JSON.parse(cart);
            }
            return false;

        },


        set: function (key, val) {

            if (val === undefined) {
                $window.localStorage .removeItem(key);
            } else {
                $window.localStorage [key] = angular.toJson(val);
            }
            return $window.localStorage [key];
        }
    };
}

function fulfilmentProvider($injector){

    this._obj = {
        service : undefined,
        settings : undefined
    };

    this.setService = function(service){
        this._obj.service = service;
    };

    this.setSettings = function(settings){
        this._obj.settings = settings;
    };

    this.checkout = function(){
        var provider;
        if (this._obj.settings.order_type == 'new'){
            provider = $injector.get('fulfilment_new_order');
        } else if (this._obj.settings.order_type == 'transfer') {
            provider = $injector.get('fulfilment_transfer_order');
        } else if (this._obj.settings.order_type == 'existed') {
            provider = $injector.get('fulfilment_existed_order');
        }
        return provider.checkout(this._obj.service, this._obj.settings);
    };

}

function fulfilment_new_order($rootScope, $http, $window, ngCart){

    this.checkout = function(service, settings) {
        if (ngCart.getAddress().id === undefined){
            $rootScope.$broadcast('ngCart:change', "请添加地址");
            return ;
        }
        if (settings.logistic_provider === undefined){
            $rootScope.$broadcast('ngCart:change', "请选择运输方式");
            return ;
        }

        $rootScope.$broadcast('alertStart', "正在处理，请稍等..");
        return $http.post('/api/orders/create_order', {
                'entries': ngCart.selectedItemsObjects(),
                'address_id': ngCart.getAddress().id,
                'coupon_codes': settings.coupon? [settings.coupon]: [],
                'logistic_provider': settings.logistic_provider,
            }).then(function(res) {
                console.log(res);
                $http.post('/payment/checkout/'+res.data.order_id, {
                    'payment_method': service,
                }).then(function(r) {
                    console.log(r);
                    $rootScope.$broadcast('alertEnd');
                    $window.location.href = r.data.url;
                }, function(){
                    $rootScope.$broadcast('alert', "oppps...something wrong..");
                });
            }, function() {
                $rootScope.$broadcast('alert', "sorry...something wrong..");
            });
    };
}


function fulfilment_existed_order($rootScope, $http, $window, ngCart){

    this.checkout = function(service, settings) {
        $rootScope.$broadcast('alertStart', "正在处理，请稍等..");

        return $http.post('/payment/checkout/'+settings.order_id, {
                'payment_method': service,
            }).then(function(r) {
                console.log(r);
                $rootScope.$broadcast('alertEnd');
                $window.location.href = r.data.url;
            }, function(){
                $rootScope.$broadcast('alert', "oppps...something wrong..");
            });
    };
}

function fulfilment_transfer_order($rootScope, $http, $window, ngCart){

    this.checkout = function(service, settings) {
        if (ngCart.getAddress().id === undefined){
            $rootScope.$broadcast('ngCart:change', "请添加地址");
            return ;
        }
        if (settings.logistic_provider === undefined){
            $rootScope.$broadcast('ngCart:change', "请选择运输方式");
            return ;
        }

        $rootScope.$broadcast('alertStart', "正在处理，请稍等..");
        return $http.post('/api/orders/update_transfer_order', {
                'order_id': settings.order_id,
                'address_id': ngCart.getAddress().id,
                'coupon_codes': settings.coupon? [settings.coupon]: [],
                'logistic_provider': settings.logistic_provider,
            }).then(function(res) {
                console.log(res);
                $http.post('/payment/checkout/'+res.data.order.id, {
                    'payment_method': service,
                }).then(function(r) {
                    console.log(r);
                    $rootScope.$broadcast('alertEnd');
                    $window.location.href = r.data.url;
                }, function(){
                    $rootScope.$broadcast('alert', "oppps...something wrong..");
                });
            }, function() {
                $rootScope.$broadcast('alert', "sorry...something wrong..");
            });
    };

}


servicesModule.factory('userInfo', userInfo);
servicesModule.filter('reverse', reverse);
servicesModule.factory('FetchData', FetchData);
servicesModule.factory('AuthService', AuthService);
servicesModule.service('ngCart', ngCart);
servicesModule.factory('ngCartItem', ngCartItem);
servicesModule.factory('store', store);
servicesModule.service('fulfilmentProvider', fulfilmentProvider);
servicesModule.service('fulfilment_new_order', fulfilment_new_order);
servicesModule.service('fulfilment_existed_order', fulfilment_existed_order);
servicesModule.service('fulfilment_transfer_order', fulfilment_transfer_order);
