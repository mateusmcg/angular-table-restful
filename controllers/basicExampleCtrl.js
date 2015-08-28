angular.module("angular-table-restful-example").controller("basicExampleCtrl", ["$scope", function($scope) {
  $scope.list = $scope.$parent.personList;
}]);