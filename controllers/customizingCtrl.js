angular.module("angular-table-restful-example").controller("customizingCtrl", ["$scope", function($scope) {
  var vm = this;	

  vm.list = [
	  {
	  	name: "Kristin Hill"
	  },
	  {
	  	name: "Valerie Francis"
	  },
	  {
	  	name: "Bob Abbott"
	  },
	  {
	  	name: "Greg Boyd"
	  },
	  {
	  	name: "Peggy Massey"
	  }
	];
}])