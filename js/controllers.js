angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
  L.mapbox.accessToken = 'pk.eyJ1IjoieW9vaG9vZ3VuMTE0IiwiYSI6ImNpZXY3bWNlbzB3a3ZyOG0wZDh0YTl6dWIifQ.YH7wQY1c7MeojFq4Z2jenw';
  var map = L.mapbox.map('map', 'mapbox.streets', {//option streets-satellite
    zoomControl: false,
    attributionControl: false
  }).setView([37.3901086, 126.65009319999999], 17);

  map.on('click', function(){
    console.log("cliked");
  });
});
