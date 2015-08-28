angular.module("angular-table-restful-example").controller("interactiveExampleCtrl", ["$scope", "$filter", function($scope, $filter) {

  var vm = this;	

  vm.originalList = $scope.$parent.personList;
  vm.filteredList = vm.originalList;

  vm.itemsPerPage = 5;
  vm.pagesToShow = 2;

  vm.add = add;
  vm.updateFilteredList = updateFilteredList;

  function add() {
    vm.originalList.push({name: vm.nameToAdd});
    vm.updateFilteredList();
  }

  function updateFilteredList() {
    vm.filteredList = $filter("filter")(vm.originalList, vm.query);
  };
}])