angular.module("angular-table-restful-example").controller("interactiveExampleCtrl", ["$scope", "$filter", function($scope, $filter) {

  var vm = this;	

  vm.originalList = $scope.$parent.personList;
  vm.filteredList = vm.originalList;

  vm.itemsPerPage = 5;
  vm.pagesToShow = 2;

  vm.add = add;
  vm.updateFilteredList = updateFilteredList;

  vm.add = function() {
    vm.originalList.push({name: vm.nameToAdd});
    vm.updateFilteredList();
  }

  vm.updateFilteredList = function() {
    vm.filteredList = $filter("filter")(vm.originalList, vm.query);
  };
}])