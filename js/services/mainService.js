/**
 * Created by yuhogyun on 2016. 1. 25..
 */
angular.module('restroom')
        .service('mainService', mainService);

function mainService($q){

  var self = this;

  self.readCommentArticle = function(){
    var deferred = $q.defer();
    var CommentArticles = Parse.Object.extend("CommentArticle");
    var query = new Parse.Query(CommentArticles);
    query.count({
      success: function (count) {
        //alert(object.length);
        deferred.resolve(count);
      },
      error: function (error) {
        alert("데이터 로딩 에러");
        deferred.reject(error);
      }
    });
    return deferred.promise;
  };

  self.readRestroom = function(){
    var deferred = $q.defer();
    var Restroom = Parse.Object.extend("restroom");
    var query = new Parse.Query(Restroom);
    query.count({
      success: function (count) {
        //alert(object.length);
        deferred.resolve(count);
      },
      error: function (error) {
        alert("데이터 로딩 에러");
        deferred.reject(error);
      }
    });
    return deferred.promise;
  };

  self.readStar = function(){
    var deferred = $q.defer();
    var CommentArticles = Parse.Object.extend("CommentArticle");
    var query = new Parse.Query(CommentArticles);
    query.find({
      success: function (result) {
        var totalStar = 0;
        for(var i=0; i<result.length; i++)
        {
          totalStar += result[i].get('star');
        }
        deferred.resolve(totalStar);
      },
      error: function (error) {
        alert("데이터 로딩 에러");
        deferred.reject(error);
      }
    });
    return deferred.promise;
  };
};
