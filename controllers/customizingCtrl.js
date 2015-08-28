angular.module("angular-table-restful-example").controller("customizingCtrl", ["$scope", function($scope) {
  var vm = this;	

  vm.list = $scope.$parent.personList;
}])