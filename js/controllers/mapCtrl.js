angular.module('restroom')
  .controller('mapCtrl',mapCtrl);

function mapCtrl($scope,$rootScope,$parse,$state,$ionicLoading,mapService, $ionicModal, $ionicPopup, $cordovaGeolocation) {
  L.mapbox.accessToken = 'pk.eyJ1IjoieW9vaG9vZ3VuMTE0IiwiYSI6ImNpZXY3bWNlbzB3a3ZyOG0wZDh0YTl6dWIifQ.YH7wQY1c7MeojFq4Z2jenw';
  $ionicLoading.show();
  ionic.Platform.ready(function () {
    var map = L.mapbox.map('map', 'mapbox.streets', {//option streets-satellite
      zoomControl: false,
      attributionControl: false,
      detectRetina: true,
    }).setView([37.3901086, 126.65009319999999], 17);
    //var layer = L.mapbox.tileLayer('mapbox.streets');
    //초기 현재위치 지정
    var now_lng = 0;
    var now_lat = 0;

    map.on('ready', function () { //지도가 다 그려지면
      console.log("지도 다 그려짐");
      //map Component
      var myLayer = L.mapbox.featureLayer().addTo(map); //현재 내 위치마커를 추가하기위한 레이어
      var directions = L.mapbox.directions({
        profile: 'mapbox.walking' //walking, driving, cycling
      });
      var directionsLayer = L.mapbox.directions.layer(directions)
        .addTo(map);
      var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions)
        .addTo(map);
      var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions)
        .addTo(map);
      var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions)
        .addTo(map);
      var directionsInstructionsControl = L.mapbox.directions.instructionsControl('instructions', directions)
        .addTo(map);

      //Variables
      var restroom_marker = []; //마커 배열의 좌표값 _latlng
      var nearest_point = L.latLng(0, 0);//가장 가까운 좌표 초기값 coordiname = [0,0]
      var geolocate = document.getElementById("geolocate");

      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      //초기설정

      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $ionicLoading.hide();
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;
          var latlng = L.latLng(latitude, longitude);
          console.log(latlng);
          //now_lng와 now_lat가 0일때가 처음임
          if (now_lat == 0 && now_lng == 0) {
            console.log("현재위치로 이동");
            map.panTo(latlng);

            mapService.loadRestroom(latlng).then(function (result) {
              console.log(result.length);
              $ionicLoading.hide();
              var markers = new L.MarkerClusterGroup();

              for (var i = 0; i < result.length; i++) {
                var title = result[i].get('name');
                var description;
                var lat = result[i].get('lat');
                var lng = result[i].get('lng');

                if ((result[i].get('address1') != undefined) && (result[i].get('address1') != ""))
                  description = result[i].get('address1');
                else if ((result[i].get('address2') != undefined) && (result[i].get('address2') != ""))
                  description = result[i].get('address2');
                else
                  description = "주소정보가 없습니다.";

                var marker = L.marker(new L.LatLng(lat, lng), {
                  icon: L.mapbox.marker.icon({'marker-symbol': 'toilets', 'marker-color': '87CEEB'})
                }).bindPopup
                ('<span><b>' + title + '</b></span><br/><span id="description">' + description + '</span><br/><button class="button button-icon ion-ios-star-outline rate"></button><button class="button button-icon ion-ios-star-outline rate"></button><button class="button button-icon ion-ios-star-outline rate"></button><button class="button button-icon ion-ios-star-outline rate"></button><button class="button button-icon ion-ios-star-outline rate"></button><br/><span id="comment_span"></span><br/><!--<button class="button button-outline button-positive departure_point" value="' + lng + ',' + lat + '">출발</button> --><button class="button button-outline button-positive detailView"  value="' + lng + ',' + lat + '">상세</button><button class="button button-outline button-assertive destination_point" value="' + lng + ',' + lat + '">도착</button><button class="button button-outline button-royal evaluation" value="' + lng + ',' + lat + ',' + title + ',' + description + '">평가</button>');

                restroom_marker.push(marker._latlng); //좌표값을 배열에 추가
                markers.addLayer(marker);
              }

              map.addLayer(markers);
              console.log("마커클러스터 로딩끝");
              markers.on('click', function (e) {
                map.panTo(e.layer._latlng);
                console.log('클릭한 마커 좌표값' + e.layer._latlng.lng + ',' + e.layer._latlng.lat);
                load_markerData(e);
              });

              var watchOptions = {timeout: 10000, enableHighAccuracy: false};

              //주기적으로 현재위치 갱신함
              var timer = setInterval(function () {
                $cordovaGeolocation
                  .getCurrentPosition(watchOptions)
                  .then(function (position) {
                      now_lng = position.coords.longitude;
                      now_lat = position.coords.latitude;
                      //console.log(now_lng + ',' + now_lat);
                      //window['mousemove'].innerHTML = position.coords.latitude + ',' + position.coords.longitude;
                      myLayer.setGeoJSON({
                        type: 'Feature',
                        geometry: {
                          type: 'Point',
                          coordinates: [now_lng, now_lat]
                        },
                        properties: {
                          'title': '출발지 설정',
                          'marker-color': '#ff8888',
                          'marker-symbol': 'pitch'
                        }
                      });
                      $ionicLoading.hide();
                    },
                    function (error) {
                      timer.clearInterval();
                      console.log("워치에러");
                      $ionicLoading.hide();
                      if ($rootScope.gps != true){
                        $scope.showError("gps 설정을 화인해 주세요.");
                      }
                      $scope.showError(JSON.stringify(error));
                      console.log('Error w/ watchPosition: ' + JSON.stringify(error));
                    });
                //console.log("타이머 실행중....");
              }, 1000);
            });
            //$ionicLoading.hide();
          }
          now_lng = latlng.lng; //126 경도
          now_lat = latlng.lat; //37 위도
          //$ionicLoading.hide();
          //console.log(now_lng);
          //map.fitBounds(e.bounds); 위치로 잘라서 이동

        }, function (err) {
          $ionicLoading.hide();
          if(err.code == 1)
            $scope.showError("GPS 권한을 확인하세요");
          else
            $scope.showError("찾기에러 \nGPS 설정을 확인하세요");
        });

      //Function
      //마커를 클릭하면 Article들을 읽어옴
      function load_markerData(e) {
        console.log('load_markerData called');
        //$ionicLoading.show();
        mapService.readCommentArticle(e).then(function (result) {
          console.log('load_marker completed');
          $ionicLoading.hide();
        });
      };


      $scope.centerNow = function () {
        console.log('현재위치');
        map.setView([now_lat, now_lng], 17);
      };

      $scope.navigate = function () {
        console.log('화장실 찾기');
        geolocate_func();
      };

      var geolocate_func = function () {
        var temp_now_lat = now_lat;
        var temp_now_lng = now_lng;
        map.setView([now_lat, now_lng], 17);
        //서울 경위도 37.541° 126.986°
        //경도 longitude , 위도 latitude
        //현재 좌표 e.latlng.lng, e.latlng.lat
        //가장 가까운 마커 계산

        for (index in restroom_marker) { //for문 돌면서 가장 가까운 화장실 찾기, 현재위치 L.latLng(lat,lng)
          if (L.latLng(temp_now_lat, temp_now_lng).distanceTo(nearest_point) > L.latLng(temp_now_lat, temp_now_lng).distanceTo(restroom_marker[index]))
            nearest_point = restroom_marker[index];
        }
        directions.setOrigin(L.latLng(temp_now_lat, temp_now_lng)); //출발지 좌표 // 현재좌표
        directions.setDestination(L.latLng(nearest_point)); //목적지 좌표
        directions.query();                                   //실행

        if (document.getElementById('geolocate'))
          geolocate.parentNode.removeChild(geolocate); // 화장실 찾기버튼 숨김

      };

      //아래부터 Addcomment버튼 함수
      $scope.comment_article = {location: '', coordinate: '', comment: ''};

      $scope.addComment = function (e) {
        $ionicLoading.show();
        mapService.createCommentArticle($scope.comment_article.lat, $scope.comment_article.lng, $scope.comment_article.comment, $scope.rate, $scope.comment_article.name, $scope.comment_article.loc, $scope.comment_article.nickName).then(function (result) {
          $scope.comment_article.lng = "";
          $scope.comment_article.lat = "";
          $scope.comment_article.name = "";
          $scope.comment_article.loc = "";
          $scope.comment_article.comment = "";
          $scope.comment_article.nickName = "";
          $scope.rate = 3;

          $scope.modalEvaluate.hide();
          $ionicLoading.hide();
        });
      };//Addcomment 함수 끝

      $scope.addRestroom = function (newRestroom) {
        $ionicLoading.show();
        mapService.createRestroom(newRestroom).then(function (result) {

          console.log(result);

          $scope.newRestroom.name = "";
          $scope.newRestroom.contact = "";
          $scope.newRestroom.address1 = "";
          $scope.newRestroom.agency = "";
          $scope.newRestroom.open = "";
          $scope.newRestroom.division = "";
          $scope.newRestroom.latlng = 0;
          $scope.modalNew.hide();
          $ionicLoading.hide();
          $scope.showNewRestroomAlert();
        });
      };

      //별의 값 1,2,3,4,5
      $scope.rate_num = [1, 2, 3, 4, 5];

      //별점주기 함수
      $scope.rateStar = function (n) {
        $scope.rate = n;
        for (var i = 0; i < 5; i++) //클릭하면 별점 초기화
        {
          $('.rate_possible').eq(i).removeClass('ion-ios-star').addClass('ion-ios-star-outline');
        }
        for (var i = 0; i < $scope.rate; i++)//별로 채워줌
        {
          $('.rate_possible').eq(i).removeClass('ion-ios-star-outline').addClass('ion-ios-star');
        }
      };

      //route click 함수
      $scope.routeClick = function () {
        if ($scope.routeBoolean == true) {
          $scope.routeBoolean = false;
        }
        else {
          $scope.routeBoolean = true;
        }
      };

      $('#map').on('click', '.destination_point', function (e) {
        $('.leaflet-popup-close-button')[0].click();
        var lng = e.target.value.split(",")[0];
        var lat = e.target.value.split(",")[1];
        directions.setDestination(L.latLng(lat, lng));
        directions.query();
      });
      $('#map').on('click', '.departure_point', function (e) {
        $('.leaflet-popup-close-button')[0].click();
        var lng = e.target.value.split(",")[0];
        var lat = e.target.value.split(",")[1];
        directions.setOrigin(L.latLng(lat, lng));
        directions.query();
      });
      $('#map').on('click', '.evaluation', function (e) {
        $('.leaflet-popup-close-button')[0].click();

        var lng = e.target.value.split(",")[0];
        var lat = e.target.value.split(",")[1];
        var name = e.target.value.split(",")[2];
        var loc = e.target.value.split(",")[3];

        $scope.comment_article.lng = lng;
        $scope.comment_article.lat = lat;
        $scope.comment_article.loc = loc;
        $scope.comment_article.name = name;
        $scope.openModal(1);
      });

      $('#map').on('click', '.detailView', function (e) {
        $('.leaflet-popup-close-button')[0].click();
        $scope.openModal(2, e);
      });

      map.on('contextmenu', function (e) {
        $scope.openModal(3, e);
      });

      map.on('blur', function () {
        console.log('blurred');
        map.invalidateSize();
      });

      map.on('error', function (err) {
        $scope.showMapAlert();
      });

      map.on('click', function (err) {
        console.log('clicked');
      });

      map.on('preclick', function () {
        console.log('preclick');
      });

      map.on('popupopen	', function (e) {
        console.log('popupopen');
      });

      // If the user chooses not to allow their location
      // to be shared, display an error message.


      myLayer.on('click', function (e) { //내 위치 클릭 이벤트, 내 위치 클릭하면 setOrigin
        console.log(e.latlng);
        directions.setOrigin(L.latLng(e.latlng.lat, e.latlng.lng)); //출발지 좌표 // 현재좌표
        directions.query();
      });

      //Modal Section
      //평가하기 모달
      $ionicModal.fromTemplateUrl('evaluate.html', {
        scope: $scope, //부모의 scope를 넘김?
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modalEvaluate = modal;
      });

      $ionicModal.fromTemplateUrl('detail.html', {
        scope: $scope, //부모의 scope를 넘김?
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modalDetail = modal;
      });

      $ionicModal.fromTemplateUrl('new.html', {
        scope: $scope, //부모의 scope를 넘김?
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modalNew = modal;
      });

      $scope.openModal = function (index, e) {

        if (index == 1) {
          $scope.rateStar(0);
          $scope.modalEvaluate.show();
        }
        else if (index == 2) {
          $ionicLoading.show();
          var lng = parseFloat(e.target.value.split(',')[0]);
          var lat = parseFloat(e.target.value.split(',')[1]);
          mapService.findRestroom(lat, lng).then(function (data) {

            $scope.detail = new Object();
            for (key in data[0].attributes) {
              if (data[0].attributes.hasOwnProperty(key)) {
                var model = $parse(key);
                model.assign($scope.detail, data[0].attributes[key]);
              }
            }

            console.log($scope.detail);

            mapService.readCommentDetail(lat, lng).then(function (data) {
              $scope.objs = data;
              $ionicLoading.hide();
              $scope.modalDetail.show();
            });
          });
        }

        else if (index == 3) {
          $scope.newRestroom = new Object();
          $scope.newRestroom.latlng = e.latlng;
          $scope.modalNew.show(e.latlng);
        }
      };

      $scope.$on('modal.shown', function () {
        console.log("modal_shown");
      });
      $scope.closeModal = function (index) {
        if (index == 1) {
          $scope.rateStar(0);
          $scope.modalEvaluate.hide();
        }
        else if (index == 2)
          $scope.modalDetail.hide();
        else if (index == 3)
          $scope.modalNew.hide();

        $scope.comment_article.lng = "";
        $scope.comment_article.lat = "";
        $scope.comment_article.name = "";
        $scope.comment_article.loc = "";
        $scope.comment_article.comment = "";
        $scope.comment_article.nickName = "";

      };

      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        $scope.modalEvaluate.remove();
        $scope.modalDetail.remove();
        $scope.modalNew.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function () {
        // Execute action
        map.invalidateSize();
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function () {
        // Execute action
      });

      //alert dialog section
      //GPS Error
      $scope.showGpsAlert = function (err) {
        var alertPopup = $ionicPopup.alert({
          title: 'Loading Error',
          template: 'GPS설정을 확인하세요.' + '<br/>' + err
        });

      };

      $scope.showNewRestroomAlert = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Success',
          template: '관리자의 확인후 화장실이 등록됩니다.'
        });
      };

      //Map Error
      $scope.showMapAlert = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Loading Error',
          template: '지도를 로딩하는데 에러가 발생했습니다.'
        });
      };

      $scope.showWatchAlert = function (latlng) {
        var alertPopup = $ionicPopup.alert({
          title: 'Watch Success',
          template: 'Geolocation is ' + latlng.coords.longitude + ',' + latlng.coords.latitude
        });
      };

      $scope.showError = function (errmsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'Watch Error',
          template: errmsg
        });
      };

    });// map loading
    $scope.$on('$ionicView.enter',function(){
      if($rootScope.gps != true){
        alert("GPS 설정을 확인하세요");
        $ionicLoading.hide();
        $state.go("tab.setting");
      }
      map.invalidateSize();
    });
    if($rootScope.gps != true){
      console.log("this?");
      $ionicLoading.hide();
      alert("GPS 설정을 확인하세요");
      $state.go("tab.setting");
    }
    map.invalidateSize();
  });
};
//http://yoohoogun114.github.io/restroomPublish/lib/ionic/js/angular.min.js.map
