angular.module("angular-table-restful-example").controller("apiCtrl", ["$http", function($http) {
  var vm = this;	

  vm.changePage = changePage;

  function changePage(pageInfo, deferred){
  	var page = 'page' + pageInfo.pageNo + '.json';

  	$http.get('api/' + page).then(function(successData){
  		deferred.resolve(successData);
  	}, function(errorData){
  		alert('Something went wrong with the API call :(');
  	});
  }

}])