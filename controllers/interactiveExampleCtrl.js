angular.module("angular-table-restful-example").controller("interactiveExampleCtrl", ["$scope", "$filter", function($scope, $filter) {

  var vm = this;	

  vm.originalList = $scope.$parent.personList;

  vm.itemsPerPage = 5;
  vm.pagesToShow = 2;

  vm.add = add;
  vm.updateFilteredList = updateFilteredList;
  vm.loadTable = loadTable;

  function add() {
    vm.originalList.push({name: vm.nameToAdd});
    vm.updateFilteredList();
  };

  function updateFilteredList() {
    vm.tableData = $filter("filter")(vm.originalList, vm.query);
  };

  function loadTable(){
    vm.tableData = null;
    vm.tableData = $scope.$parent.personList;
  };
  
}])