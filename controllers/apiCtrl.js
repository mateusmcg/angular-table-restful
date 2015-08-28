angular.module("angular-table-restful-example").controller("apiCtrl", ["$http", function($http) {
  var vm = this;	

  vm.changePage = changePage;

  function changePage(pageInfo, deferred){
  	var page = 'page' + pageInfo.pageNo + '.json';

  	$http.get('api/' + page).then(function(successData){
      var arrayData = successData.data.result;
      arrayData.totalCount = successData.data.totalCount;
      arrayData.pageNo = successData.data.pageNo;
  		deferred.resolve(arrayData);
  	}, function(errorData){
  		alert('Something went wrong with the API call :(');
  	});
  }

}])