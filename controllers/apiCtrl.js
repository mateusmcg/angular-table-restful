angular.module("angular-table-restful-example").controller("apiCtrl", ["$http", function($http) {
  var vm = this;	

  vm.getList = getList;
  vm.changePage = changePage;

  function changePage(pageInfo, deferred){
  	var page = 'page' + pageInfo.pageNo + '.json';

  	$http.get(page).then(function(successData){
  		deferred.resolve(successData);
  	}, function(errorData){
  		alert('Something went wrong with the API call :(');
  	});
  }

}])