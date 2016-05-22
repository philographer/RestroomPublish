// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('restroom', ['ionic', 'ngCordova'])

  .run(function($ionicPlatform, $cordovaGeolocation, $rootScope) {
    Parse.initialize("1gDh8NI0aWUwoqSuGtwpYsmWsw90E5dQBZQ2dFfo", "9rQRrY2K32TTaFrbawrUWGFkaTj2bzqwoUsiVFYx");

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)

      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }


      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          console.log("position detected");
        },function(error){
          if(error.code == 1)
            alert('GPS 권한을 확인해 주세요.');
          else
            alert('GPS Error \n 앱 종료후 다시 실행하세요');
        });

      $rootScope.gps = true;



    });
  })

  .config(function($stateProvider, $urlRouterProvider) {




    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    $stateProvider
    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.main', {
        url: '/main',
        views: {
          'tab-main':{
            templateUrl: 'templates/tab-main.html',
            controller: 'mainCtrl'
          }
        }
      })

      .state('tab.map', {
        url: '/map',
        views: {
          'tab-map': {
            templateUrl: 'templates/tab-map.html',
            controller: 'mapCtrl'
          }
        }
      })

      .state('tab.setting', {
        url: '/setting',
        views: {
          'tab-setting': {
            templateUrl: 'templates/tab-setting.html',
            controller: 'settingCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/main');
  });
