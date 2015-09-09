angular.module("angular-table-restful-example").controller("basicExampleCtrl", ["personList", function(personList) {
	var vm = this;

  	vm.list = personList;
}]);