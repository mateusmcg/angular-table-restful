# angular-table-restful
A table for [AngularJs](https://angularjs.org/) with support for restful API standard.

##### [DEMO](http://mateusmcg.github.io/angular-table-restful/)

  1. [Install](#install)
  1. [API Pagination](#api-pagination)
  1. [How To Use](#how-to-use)


### Install

* Use [bower](http://bower.io/) to install the package: 

    ```shell
      bower install angular-table-restful --save
    ```

* Or manually add the .js file to your page:

    ```shell
    <script src='assets/libs/angular-table-restful/angular-table.js'></script>
    ```

* Include module dependency:

   ```javascript
      angular.module('yourApp', ['angular-table']);
   ```
======

### API Pagination

* You have a large data set and don't want to load it all at once when the page is loaded? So you came to the right place. 

* With API Pagination support you don't need to load hundreds or thousands of lines of data at once, you simply load only the page that you want making the request to the back-end service light, fast and simple.

* See more details [here](#attable).
======

### How To Use

  1. [atTable](#attable)

#### atTable

   - This is the main attribute that you are going to use and where the magic happens. It receives both the data that will be used to load the grid (in memory) and also receives an object or a function that will be used to manipulate the API Pagination data.
   
   ##### Example:

       + InMemory data:
       
        * View
        ```html
            <table at-table="vm.myList">
                <tbody>
                    <tr>    
                        <td at-sortable at-attribute="index" at-title="Index"></td>
                        <td at-sortable at-attribute="name" at-title="Name"></td>
                        <td at-sortable at-attribute="email" at-title="Email"></td>
                    </tr>
                </tbody>
            </table>
        ```
           
        * Controller
        ```javascript
            angular.module("angular-table-restful-example")
            .controller("basicExampleCtrl", ["$scope", function($scope) {
                var vm = this;
                vm.myList = [
                    {
                        id: 1,
                        name: 'Sample Name',
                        email: 'sample@email.com'
                    }
                    ...
                ]
            }]);
        ```

