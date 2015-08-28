angular.module("angular-table-restful-example", ["angular-table", "angular-tabs"]);


angular.module("angular-table-restful-example")
.controller("example-ctrl", ["$scope", "$filter", function($scope, $filter) {

    $scope.personList = [
      {
        index: 1,
        name: "Kristin Hill",
        email: "kristin@hill.com"
      },
      {
        index: 2,
        name: "Valerie Francis",
        email: "valerie@francis.com"
      },
      {
        index: 3,
        name: "Bob Abbott",
        email: "bob@abbott.com"
      },
      {
        index: 4,
        name: "Greg Boyd",
        email: "greg@boyd.com"
      },
      {
        index: 5,
        name: "Peggy Massey",
        email: "peggy@massey.com"
      },
      {
        index: 6,
        name: "Janet Bolton",
        email: "janet@bolton.com"
      },
      {
        index: 7,
        name: "Maria Liu",
        email: "maria@liu.com"
      },
      {
        index: 8,
        name: "Anne Warren",
        email: "anne@warren.com"
      },
      {
        index: 9,
        name: "Keith Steele",
        email: "keith@steele.com"
      },
      {
        index: 10,
        name: "Jerome Lyons",
        email: "jerome@lyons.com"
      },
      {
        index: 11,
        name: "Jacob Stone",
        email: "jacob@stone.com"
      },
      {
        index: 12,
        name: "Marion Dunlap",
        email: "marion@dunlap.com"
      },
      {
        index: 13,
        name: "Stacy Robinson",
        email: "stacy@robinson.com"
      },
      {
        index: 14,
        name: "Luis Chappell",
        email: "luis@chappell.com"
      },
      {
        index: 15,
        name: "Kimberly Horne",
        email: "kimberly@horne.com"
      },
      {
        index: 16,
        name: "Andy Smith",
        email: "andy@smith.com"
      }
    ]
}
]);
