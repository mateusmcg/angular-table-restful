angular.module("angular-table-restful-example").controller("apiCtrl", ["$http", function($http) {
  var vm = this;	

  vm.changePage = changePage;

  //You must have a function specified on the 'at-change' attribute in order for the API Pagination to work.
  //Also the data that is passed to the 'deferred' must be an array with two more properties to work properly.
  //totalCount -> Total count of all items (e.g.: 3 pages with 5 items each, totalCount: 15).
  //pageNo -> The page that the API will retreive (same value that the pageInfo.pageNo has).
  function changePage(pageInfo, deferred){
    //The pageInfo parameters will have the following information:
    //  -> pageNo (int)
    //  -> pageSize (int)
    //  -> sort (string array, e.g.: '-name' will order the list by name DESC and 'name' will order the list by name ASC)
  	var page = 'page' + pageInfo.pageNo + '.json';

  	$http.get('api/' + page).then(function(successData){
      var data = prepareData(successData.data);
  		deferred.resolve(data);
      console.log(data); //Also you can take a look at the api folder from this repo and see the json data.
  	}, function(errorData){
  		alert('Something went wrong with the API call :(');
  	});
  }

  //This function could be an interceptor, just treat the API result
  function prepareData(data){
    var extractedData = [];

    extractedData = data.pageItems;
    extractedData.totalCount = data.totalCount;
    extractedData.pageNo = data.pageNo;

    return extractedData;
  }

}])