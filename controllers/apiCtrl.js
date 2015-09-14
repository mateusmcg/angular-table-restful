angular.module("angular-table-restful-example").controller("apiCtrl", ["$http", function($http) {
  var vm = this;

  vm.clear = clear;
  vm.refresh = refresh;
  vm.hasData = hasData;
  vm.checkboxChange = checkboxChange;
  vm.getCheckedItems = getCheckedItems;
  vm.selectedItemList = [];

  //Keep in mind that without the 'changeEvent' function, the API Pagination will NOT work.
  vm.myTableConfig = {
    changeEvent: tableChangeEvt,
    loadOnStartup: true, //Responsible to load the table when page loads.

    //The 'Primary Key' for your table. Put in here the property that will identify each item.
    checkedKey: function() {
        return "name";
    },
    //How the table will know that an item is checked? Put here a filter that will tell it that.
    //It can be a string/object/function. See the doc above for 'Angular filter'.
    checkedFilter: function() {
        return {
            selected: true
        };
    },
    checkItem: function(obj, bool) {
        obj.selected = bool;
        vm.getCheckedItems(obj);
    }
  };

  function tableChangeEvt(pageInfo, deferred) {
    //Take a look at it and see the functionalities that you can use.
    console.log('vm.myTableConfig', vm.myTableConfig);

    var page = 'page' + pageInfo.pageNo + '.json';

    $http.get('api/' + page).then(function(successData){
      vm.apiError = false;
      deferred.resolve(successData.data);
    }, function(errorData){
      vm.apiError = true;
    });
  }

  //These are some examples of functionalities that you can use.
  //For a full view check out the 'vm.myTableConfig' object at the console log or the docs.
  function refresh() {
    vm.myTableConfig.refresh();
  }

  function clear() {
    vm.myTableConfig.clearData(); 
  }

  function hasData() {
    return vm.myTableConfig.hasData(); 
  }

  //When the 'checkAll' checkbox gets triggered.
  function checkboxChange() {
      //This function will trigger the 'checkItem' function for each item in the currentPage checking or unchecking them all.
      vm.myTableConfig.checkAllItems(vm.allChecked);
  }

  function getCheckedItems(item) {    
    if(item.selected)
      vm.selectedItemList.push(item);
    else {      
      var index = vm.selectedItemList.indexOf(item);
      if(index > -1){
        vm.selectedItemList.splice(index, 1);
      }      
    }
  }

}])