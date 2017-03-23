'use strict';

var angular = require('angular');

// angular modules
require('angular-route');
require('angular-touch');
require('angular-sanitize');
require('angular-cookies');
require('./angular-carousel');
require('./paginate-anything');
require('./templates');
require('./controllers/_index');
require('./services/_index');
require('./directives/_index');

// create and bootstrap application
angular.element(document).ready(function() {

  var requires = [
    'ngRoute',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'angular-carousel',
    'bgf.paginateAnything',
    'templates',
    'app.controllers',
    'app.services',
    'app.directives',
  ];

  // mount on window for testing
  window.app = angular.module('app', requires);

  angular.module('app').constant('AppSettings', require('./constants'));

  angular.module('app').config(require('./on_config'));

  angular.module('app').run(require('./on_run'));

  angular.bootstrap(document, ['app']);

});
