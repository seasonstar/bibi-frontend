define(['angular'], function (angular) {

    var appServices = angular.module('maybi.services', ['ngRoute', 'ngCookies', 'angular-carousel', 'ngTouch']);
    //=======================   服务  =======================
    //全局变量定义
    appServices.factory('globals', [function () {
        var SERVER = 'http://api.maybi.cn';
        var TEST_SERVER = 'http://192.168.31:134:5000';
        return {
            SERVER: SERVER,
            TEST_SERVER: TEST_SERVER,
        }
    }]);

    appServices.factory('userInfo', ['$http', '$cookies', function ($http, $cookies) {
        var user_info = {};
        return {
            setUserInfo: function (obj) {
                user_info = obj;
            },
            getUserInfo: function () {
                return user_info;
            }
        }
    }]);

    //通用请求数据服务
    appServices.factory('FetchData', ['$http', '$cookies', '$location', '$q', 'globals', function ($http, $cookies, $location, $q, globals) {
        return {
            get: function (url, kargs) {
                var server_url = url ;
                var d = $q.defer();
                $http({
                    method: "GET",
                    url: server_url,
                    params: kargs

                }).then(function(res, status) {
                    console.log('postData() success: ', res);
                    if (status === 200 && res.message == "OK") {
                        console.log('fetchData() success: ', res);
                        d.resolve(res);
                    } else {
                        console.log('不明原因');
                        d.reject();
                    }
                }).error(function (data){
                    d.reject();
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
                        console.log('不明原因');
                        d.reject();
                    }
                }).error(function (data){
                    d.reject();
                });
                return d.promise;
            }
        }
    }]);

    appServices.factory('authHttpResponseInterceptor', [function () {
        var header_left_buttons = {
            "default": {
                "icon": "back",
                "ngHref": "back",
                "show": true
            },
            "profile": {
                "icon": "profile",
                "ngHref": "account",
                "show": true
            },
            "login": {
                "icon": "profile",
                "ngHref": "login",
                "show": true
            },
            "home": {
                "icon": "home",
                "ngHref": "/",
                "show": true
            },
            "blank": {
                "text": "",
                "ngHref": "",
                "show": false
            }
        };
        var header_right_buttons = {
            "default": {
                "text": "",
                "ngHref": "",
                "show": false
            },
            "cart": {
                "icon": "cart",
                "ngHref": "cart",
                "show": true
            },
            "register": {
                "text": "注册",
                "ngHref": "register",
                "show": true
            },
            "save_my_seat_rule": {
                "text": "规则",
                "ngHref": "",
                "show": true
            }
        };
        return {
            "header_left_buttons": header_left_buttons,
            "header_right_buttons": header_right_buttons
        };
    }]);

    //登陆服务
    appServices.factory('AuthService', ['$http', '$cookies', '$location', '$timeout', '$q','userInfo', 'globals',function ($http, $cookies, $location, $timeout, $q, userInfo, globals) {
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
                }).error(function (data){
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
                }).error(function (data){
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
                }).error(function (data) {
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
                }).error(function (data){
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
                    if (data.message == "OK" && data.login == true){
                        isAuthenticated = true;
                        userInfo.setUserInfo(data.user);
                        self.setToken(data.remember_token);
                        $location.url($location.path());
                        $location.path('/account');
                    } else if(data.message == "OK" && data.login == false){
                        isAuthenticated = false;
                        $location.url($location.path());
                        $location.path('/account/bind_email/'+data.user_id);
                    }
                }).error(function (data){
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
                }).error(function (data) {
                    deferred.reject();
                });

                return deferred.promise;
            },

            setToken: function (token) {
                $cookies.token = token;
            },

            getToken: function () {
                return $cookies.token;
            },
        };
    }]);

    return appServices;

});
