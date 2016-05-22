/**
 * Created by yuhogyun on 2016. 1. 23..
 */
angular.module('restroom')
  .controller('settingCtrl',settingCtrl);

function settingCtrl($scope,$rootScope,settingService,$cordovaDevice){
  console.log('settingCtrl called');
  $scope.gps = $rootScope.gps;

  $scope.execute = function(settings){
    $rootScope.gps = settings;
  };

}


