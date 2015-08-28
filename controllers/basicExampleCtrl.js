angular.module("angular-table-restful-example").controller("basicExampleCtrl", ["$scope", function($scope) {
	var vm = this;

  	vm.list = $scope.$parent.personList;
}]);