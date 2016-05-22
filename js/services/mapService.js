/**
 * Created by yuhogyun on 2016. 1. 23..
 */
angular.module('restroom')
   .service('mapService', mapService);

function mapService($q, $ionicLoading){

  console.log("mapService called");

  var self = this;

  this.createCommentArticle = function (lat, lng, comment, star, name, loc, nickName){

    var deferred = $q.defer();
    var CommentArticles = Parse.Object.extend("CommentArticle");
    var Restroom = Parse.Object.extend("restroom");
    var commentArticle = new CommentArticles;
    var query = new Parse.Query(Restroom);

    console.log(lat);
    console.log(lng);

    query.equalTo("lat", parseFloat(lat));
    query.equalTo("lng", parseFloat(lng));
    query.equalTo("name", name.toString());

    query.first({
      success: function (object) {
        commentArticle.set("lat", parseFloat(lat));
        commentArticle.set("lng", parseFloat(lng));
        commentArticle.set("comment", comment);
        commentArticle.set("star", star);
        commentArticle.set("name", name);
        commentArticle.set("loc", loc);
        commentArticle.set("nickName", nickName);
        commentArticle.set("restroom", object);
        commentArticle.save(null,{
          success: function(commentArticle){
            deferred.resolve();
          },
          error: function(commentArticle, error){
            alert("데이터 저장 오류발생");
            deferred.reject();
          }
        });
      },
      error: function (error) {
        alert("화장실 위치 정보를 찾을 수 없습니다.");
        deferred.reject(error);
      }
    });


    return deferred.promise;
  };

  this.readCommentArticle = function(event){
    $ionicLoading.show();

    var deferred = $q.defer();

    var CommentArticles = Parse.Object.extend("CommentArticle");
    var query = new Parse.Query(CommentArticles);
    console.log(typeof(event.layer._latlng.lng));
    console.log(typeof(event.layer._latlng.lat));

    query.equalTo('lng', event.layer._latlng.lng);
    query.equalTo('lat', event.layer._latlng.lat);
    query.find({
      success: function(object){ //데이터를 성공적으로 가져오면 별점계산하고 코멘트 읽어다 붙임
        var total_star = 0;
        console.log(object);
        console.log("데이터 로딩 성공");
        for(var i=0; i< object.length; i++){
          result = object[i];
          console.log(result.get('star'));
          total_star += result.get('star');
          var recent_comment = object[i].get('comment'); //마지 코멘트 가져옴
        }

        var average_star = Math.round(total_star / object.length); //반올림
        console.log('average_star :' +average_star);
        for(var i=0; i < 5; i++) //별점 초기화
        {
          $('.rate').eq(i).removeClass('ion-ios-star').addClass('ion-ios-star-outline');
        }
        for(var i=0; i<average_star; i++)//별로 채워줌
        {
          $('.rate').eq(i).removeClass('ion-ios-star-outline').addClass('ion-ios-star');
        }

        if(recent_comment == null)//평가가 없음
          document.getElementById('comment_span').innerHTML = "평가가 없습니다.";
        else if(document.getElementById('comment_span') != null)
          document.getElementById('comment_span').innerText = recent_comment;


        return deferred.resolve(object);
      },
      error: function(error){
        console.log("데이터 로딩 에러");
        return deferred.reject(error);
      }
    });

    return deferred.promise;
  };

  this.readCommentDetail = function(lat, lng){
    var deferred = $q.defer();
    var CommentArticle = Parse.Object.extend('CommentArticle');
    var query = new Parse.Query(CommentArticle);
    query.equalTo('lat', parseFloat(lat));
    query.equalTo('lng', parseFloat(lng));
    query.find({
      success: function(object){
        deferred.resolve(object)
      },
      error: function(error){
        deferred.reject(error)
      }
    });
    return deferred.promise;
  };


  this.createRestroom = function(newRestroom){

    console.log(newRestroom);
    var deferred = $q.defer();
    var Restroom = Parse.Object.extend("restroomNew");
    var restroom = new Restroom;
    restroom.set("name", newRestroom.name);
    restroom.set("contact", newRestroom.contact);
    restroom.set("address1", newRestroom.address1);
    restroom.set("agency", newRestroom.agency);
    restroom.set("open", newRestroom.open);
    restroom.set("division", newRestroom.division);
    restroom.set("lat", parseFloat(newRestroom.latlng.lat));
    restroom.set("lng", parseFloat(newRestroom.latlng.lng));

    restroom.save(null,{
      success: function(result){
        deferred.resolve(result);
      },
      error: function(result, error){
        alert("데이터 저장 오류발생");
        deferred.reject(error);
      }
    });

    return deferred.promise;
  };

  //retrieve all object
  this.loadRestroom = function(latlng){

    console.log(latlng);

    $ionicLoading.show();
    var deferred = $q.defer();

    var latMax = parseFloat(parseFloat(latlng.lat) + 0.2);
    var lngMax = parseFloat(parseFloat(latlng.lng) + 0.2);
    var latMin = parseFloat(parseFloat(latlng.lat) - 0.2);
    var lngMin = parseFloat(parseFloat(latlng.lng) - 0.2);
    var result = [];
    var processCallback = function(res) {
      result = result.concat(res);
      if (res.length == 1000) {
        process(res[res.length-1].id);
        return;
      }

      deferred.resolve(result);
    }

    var process = function(skip) {
      var Restroom = Parse.Object.extend('restroom');
      var query = new Parse.Query(Restroom);

      if (skip) {
        query.greaterThan("objectId", skip);
      }
      query.ascending("objectId");
      query.greaterThan("lat",latMin);
      query.lessThan("lat",latMax);
      query.greaterThan("lng",lngMin);
      query.lessThan("lng",lngMax);
      query.limit(1000);
      query.find().then(function querySuccess(res) {
        console.log('find');
        processCallback(res);
      }, function queryFailed(error) {
        deferred.reject(error);
        console.log(error);
      });
    }
    process(false);

    return deferred.promise;
  };

  //find one restroom by latlng
  this.findRestroom = function(lat, lng){
    var deferred = $q.defer();
    var Restroom = Parse.Object.extend('restroom');
    var query = new Parse.Query(Restroom);
    query.equalTo('lat', lat);
    query.equalTo('lng', lng);
    query.find({
      success: function(result){
        deferred.resolve(result);
      },
      error: function(err){
        console.log(err);
        deferred.reject(err);
      }
    });

    return deferred.promise;
  };

};
