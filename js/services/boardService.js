/**
 * Created by yuhogyun on 2016. 1. 25..
 */
angular.module('restroom')
  .service('boardService', boardService);

function boardService($q){
  console.log("boardService called");
  var self = this;
  console.log('boardService injected');

  self.readList = function(){
    console.log('readList called');

    var deferred = $q.defer();
    var CommentArticles = Parse.Object.extend("CommentArticle");
    var query = new Parse.Query(CommentArticles);

    query.limit(1000);
    query.ascending("restroom");

    query.find({
      success: function (object) {
        //var post = object.
        //alert(object.length);
        deferred.resolve(object);
      },
      error: function (error) {
        alert("데이터 로딩 에러");
        deferred.reject(error);
      }
    });
    return deferred.promise;
  };
}
