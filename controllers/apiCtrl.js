angular.module("angular-table-restful-example").controller("apiCtrl", ["$http", function($http) {
  var vm = this;

  vm.myTableConfig = {
      changeEvent: tableChangeEvt,
      loadOnStartup: true //Make sure to load the table when page loads.
  };

  function tableChangeEvt(pageInfo, deferred) {
      var page = 'page' + pageInfo.pageNo + '.json';

      $http.get('api/' + page).then(function(successData){
          var data = prepareData(successData.data);
          deferred.resolve(data);
      }, function(errorData){
          vm.apiError = true;
      });
  }

    //This function could be an interceptor, just treat the API response
  function prepareData(data){
      var extractedData = [];

      extractedData = data.pageItems;

      //totalCount -> Total count of all items (e.g.: 3 pages with 5 items each, totalCount: 15).
      extractedData.totalCount = data.totalCount;

      //pageNo -> The page that the API will retreive (same value that the pageInfo.pageNo has).
      extractedData.pageNo = data.pageNo;

      return extractedData;
  }

}])