/**
 * 入口文件
 * 2014-11-30 mon
 */
require.config({
    baseUrl: "/static/js/",
    waitSeconds: 0,
    paths: {
      "angular" : "libs/angular.min",
      "angular-route" : "libs/angular-route.min",
      "angular-touch" : "libs/angular-touch.min",
      "angular-sanitize" : "libs/angular-sanitize.min",
      "angular-cookies" : "libs/angular-cookies.min",
      "angular-carousel" : "libs/angular-carousel.min",
      "ngCart" : "libs/ngCart",

      "app" : "app",
      "controllers" : "controllers",
      "directives" : "directives",
      "services" : "services",

    },
    shim: {
       'angular': {
          exports: 'angular'
       },
       'angular-route':{
          deps: ["angular"],
          exports: 'angular-route'
       },
       'angular-touch':{
          deps: ["angular"],
          exports: 'angular-touch'
       },
       'angular-cookies':{
          deps: ["angular"],
          exports: 'angular-cookies'
       },
       'angular-sanitize':{
          deps: ["angular"],
          exports: 'angular-sanitize'
       },
       'angular-carousel':{
          deps: ["angular"],
          exports: 'angular-carousel'
       },
       'ngCart':{
          deps: ["angular"],
          exports: 'ngCart'
       },
    },
    priority: [
		"angular"
	],
    urlArgs: "bust=" + (new Date()).getTime()
});


require([
        'angular',
        'angular-route',
        'angular-touch',
        'angular-cookies',
        'angular-carousel',
        'angular-sanitize',
        'ngCart',
        'app',
        'controllers',
        'directives',
        'services',
        ],function (angular){
            angular.bootstrap(document,["maybiApp"]);
      });
