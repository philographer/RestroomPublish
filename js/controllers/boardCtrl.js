/**
 * Created by yuhogyun on 2016. 1. 25..
 */
angular.module('restroom')
  .controller('boardCtrl',boardCtrl);

function boardCtrl($scope, $ionicLoading,$ionicPopup,boardService){
  console.log('boardCtrl called');

  $scope.$on('$ionicView.enter', function(e) {
    $ionicLoading.show();
    $scope.objs = new Object();
    boardService.readList().then(function(result){
      $scope.objs = result;
      $ionicLoading.hide();
    }, function(error){
      $scope.showLoadAlert;
    });
  });

  //Parse LoadError Error
  $scope.showLoadAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Loading Error',
      template: '게시판 정보를 가져오는데 에러가 있습니다.'
    });
  };

}
