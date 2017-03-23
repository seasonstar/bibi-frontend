define(['angular'], function (angular) {
    var app = angular.module('maybiApp', ['ngRoute', 'ngCookies', 'angular-carousel', 'ngTouch', 'ngCart', 'maybi.directives','maybi.services','maybi.controllers']);

    app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
        //$locationProvider.html5Mode(true);

        $routeProvider.when('/', {
            templateUrl: 'static/partials/main.html',
            controller: 'mainCtrl',
            page_title: '美比',
            header_left_button: 'profile',
            header_right_button: 'cart',
            loginRequired: false,
        }).when('/items', {
            templateUrl: 'static/partials/items.html',
            controller: 'itemsCtrl',
            page_title: '商品列表',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: false,
        }).when('/items/:itemID', {
            templateUrl: 'static/partials/item.html',
            controller: 'itemCtrl',
            page_title: '商品详情',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: false,
        }).when('/board/:boardID', {
            templateUrl: 'static/partials/board.html',
            controller: 'boardCtrl',
            page_title: '专题详情',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: false,
        }).when('/cart', {
            templateUrl: 'static/partials/cart.html',
            controller: 'cartCtrl',
            page_title: '购物车',
            header_left_button: 'default',
            header_right_button: 'default',
            loginRequired: false,
        }).when('/checkout', {
            templateUrl: 'static/partials/checkout.html',
            controller: 'checkoutCtrl',
            page_title: '结算',
            header_left_button: 'default',
            header_right_button: 'default',
            loginRequired: true,
        }).when('/address', {
            templateUrl: 'static/partials/address.html',
            controller: 'addressCtrl',
            page_title: '选择地址',
            header_left_button: 'default',
            header_right_button: 'default',
            loginRequired: true,
        }).when('/address/list', {
            templateUrl: 'static/partials/address_list.html',
            controller: 'addressCtrl',
            page_title: '列表地址',
            header_left_button: 'default',
            header_right_button: 'default',
            loginRequired: true,
        }).when('/address/add', {
            templateUrl: 'static/partials/add_address.html',
            controller: 'addressFormCtrl',
            page_title: '添加地址',
            header_left_button: 'default',
            header_right_button: 'default',
            loginRequired: true,
        }).when('/address/edit/:addr_id', {
            templateUrl: 'static/partials/add_address.html',
            controller: 'addressFormCtrl',
            page_title: '编辑地址',
            header_left_button: 'default',
            header_right_button: 'default',
            loginRequired: true,
        }).when('/login', {
            templateUrl: 'static/partials/login.html',
            controller: 'loginCtrl',
            page_title: '登录',
            header_left_button: 'home',
            header_right_button: 'register',
            loginRequired: false,
        }).when('/logout', {
            controller: 'logoutCtrl',
        }).when('/account/oauth/:sitename', {
            templateUrl: 'static/partials/oauth_success.html',
            controller: 'oauthCtrl',
        }).when('/payment/success', {
            templateUrl: 'static/partials/payment_success.html',
            controller: 'paymentSuccessCtrl',
            header_left_button: 'home',
            header_right_button: 'blank',
        }).when('/payment/cancel', {
            templateUrl: 'static/partials/payment_cancel.html',
            controller: 'paymentCancelCtrl',
            header_left_button: 'home',
            header_right_button: 'blank',
        }).when('/register', {
            templateUrl: 'static/partials/register.html',
            controller: 'registerCtrl',
            page_title: '注册',
            header_left_button: 'default',
            header_right_button: 'default',
            loginRequired: false,
        }).when('/account', {
            templateUrl: 'static/partials/personal_center.html',
            controller: 'accountCtrl',
            page_title: '个人中心',
            header_left_button: 'home',
            header_right_button: 'cart',
            loginRequired: true,
        }).when('/account/bind_email/:user_id', {
            templateUrl: 'static/partials/bind_email.html',
            controller: 'bindEmailCtrl',
            page_title: '绑定邮箱',
            header_left_button: '',
            header_right_button: '',
        }).when('/orders', {
            templateUrl: 'static/partials/orders.html',
            controller: 'ordersCtrl',
            page_title: '我的订单',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: true,
        }).when('/orders/:order_id', {
            templateUrl: 'static/partials/order_detail.html',
            controller: 'orderDetailCtrl',
            page_title: '订单详情',
            header_left_button: 'default',
            header_right_button: 'profile',
            loginRequired: true,
        }).when('/favors', {
            templateUrl: 'static/partials/favors.html',
            controller: 'favorCtrl',
            page_title: '我的喜欢',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: true,
        }).when('/faq', {
            templateUrl: 'static/partials/faq.html',
            controller: 'faqCtrl',
            page_title: '常见问题',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: false,
        }).when('/customer-service', {
            templateUrl: 'static/partials/cs.html',
            controller: 'csCtrl',
            page_title: '联系客服',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: false,
        }).when('/feedback', {
            templateUrl: 'static/partials/feedback.html',
            controller: 'feedbackCtrl',
            page_title: '意见反馈',
            header_left_button: 'default',
            header_right_button: 'cart',
            loginRequired: false,
        }).when('/fourZeroFour', {
            templateUrl: 'static/partials/404.html',
            controller: 'fourZeroFour_controller',
            page_title: '没找到',
            header_left_button: 'blank',
            header_right_button: 'default',
            loginRequired: false,
        }).otherwise({
            redirectTo: '/fourZeroFour'
        });

    }]);

    app.run(['$rootScope', '$location', '$log', 'AuthService', function ($rootScope, $location, $log, AuthService) {
        $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
            if (AuthService.isLoggedIn() === false) {
                var token = AuthService.getToken();
                if (token) {
                    AuthService.authenticate(token)
                        .then(function() {

                        }).catch(function() {
                            AuthService.setToken('');
                        })
                } else if (next.loginRequired) {
                    $location.path('/login');
                }
            }
        });
    }]);

    return app;

});
