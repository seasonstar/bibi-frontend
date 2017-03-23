'use strict';

/**
 * @ngInject
 */
function OnRun($rootScope, $location, $http, $log, AuthService, ngCart, AppSettings ,store) {

    // ngCart
    $rootScope.$on('ngCart:change', function(){
        ngCart.$save();
    });

    if (angular.isObject(store.get('cart'))) {
        ngCart.$restore(store.get('cart'));
    } else {
        console.log('init');
        ngCart.init();
        $http.get('/api/cart').then(function(data) {
            ngCart.$loadCart(data.cart);
        });
    }

    // change page title based on state
    $rootScope.l_btn= 'default';
    $rootScope.r_btn= 'default';
    $rootScope.getPageTitle = '美比';

    $rootScope.$on('$routeChangeSuccess', function (event, next) {
        $rootScope.pageTitle = '';
        if ( next.title ) {
          $rootScope.pageTitle += next.page_title;
        }
        $rootScope.pageTitle += AppSettings.appTitle;

        $rootScope.l_btn = AppSettings.header_left_buttons[next.header_left_button];
        $rootScope.r_btn = AppSettings.header_right_buttons[next.header_right_button];
        $rootScope.getPageTitle = next.page_title;

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

}

module.exports = OnRun;
