angular.module("angular-table-restful-example").controller("interactiveExampleCtrl", ["$scope", "$filter", function($scope, $filter) {
  $scope.originalList = $scope.$parent.personList;

  $scope.filteredList = $scope.originalList;

  $scope.itemsPerPage = 5;

  $scope.add = function() {
    $scope.originalList.push({name: $scope.nameToAdd});
    $scope.updateFilteredList();
  }

  $scope.updateFilteredList = function() {
    $scope.filteredList = $filter("filter")($scope.originalList, $scope.query);
  };
}])