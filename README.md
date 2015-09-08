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

* Or manually add the following files to your page:

    ```shell
    <link rel="stylesheet" href="../angular-table-restful.css">
    <script src='../angular-table-restful.js'></script>
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
  1. [atPaginated](#atpaginated)
  1. [atAttribute](#atattribute)
  1. [atTitle](#attitle)
  1. [atSortable](#atsortable)
  1. [atScroll](#atscroll)
  1. [atEllipsis](#atellipsis)
  1. [atLoadOnStartup](#atloadonstartup)
  1. [atPagesToShow](#atpagestoshow)  
  1. [Example](#example)  

#### atTable

   - This is the main attribute that you are going to use and where the magic happens. It receives both the data that will be used to load the grid (in memory) and also receives an object or a function that will be used to manipulate the API Pagination data.

#### atPaginated

   - This attribute is responsible for displaying the pagination at the bottom of the table. In case you don't want to display it, just don't use this attribute.

#### atAttribute

   - This attribute is responsible for binding the items in the array and creating the header for each one of them (The value should match with item's attribute name).

#### atIgnoreHeader

   - This attribute is responsible for unbinding the ```at-attribute```  header, rendering only the ```thead``` that is written explicitly in the html allowing you to customize the header the way you want it. e.g.:
```html
<!-- Keep in mind that you can add ng-if/ng-show or anything that you want to make the table that matches your needs -->
<table at-table="vm.myList">
<thead at-ignore-header>
    <tr>
        <th> <!-- Some custom header, like a checkbox to check all items or make a group header separator--></th>
    </tr>        
</thead>
<tbody>
    <tr>
        <td><!-- Some custom item, like a checkbox or a group of headers --></td>
    </tr>
</tbody>
</table>
```

#### atTitle

   - This attribute is responsible for changing the header name that will be displayed. If this attribute is not used, the default will be the [atAttribute](#atattribute) value.

#### atSortable

   - This attribute is responsible for enabling sort at the specific column. If this attribute is not used, the column will not be sortable.

#### atScroll

   - This attribute is responsible for adding a horizontal scroll to the table for responsive purposes. By default if you resize your browser you'll see the scroll, if you don't want it you need to add this attribute and set it to false. e.g.:
```html
<table at-scroll="false">
```

#### atEllipsis

   - This attribute is responsible for adding a '...' at the end of each cell when it's content is too large. Its a default behavior, in case you don't want it add the attribute and set it to false. e.g.:
```html
<table at-ellipsis="false">
```

#### atLoadOnStartup

   - (API Pagination only) This attribute is responsible for loading the table when the page is loaded, triggering the changeEvent function. e.g.:
       + 1st way:
    ```html
    <table at-load-on-startup>
    ```
       + 2nd way:
          Inside the controller, at the ```vm.myTableConfig``` add the following attribute:

    ```javascript
    vm.myTableConfig = {
        ...                
        loadOnStartup: true
    };
    ```

#### atPagesToShow

   - (API Pagination only) This attribute is responsible for the number of pages that will be displayed in the pagination (default: 5). e.g.:
```html
<table at-pages-to-show="10">
```
   
#### Example:

   - InMemory data:
    All you need to do here is pass the data and the grid will be ready to go with all the items loaded.

    + View
    ```html
        <table at-table="vm.myList" at-paginated>
            <tbody>
                <tr>    
                    <td at-sortable at-attribute="index" at-title="Index"></td>
                    <td at-sortable at-attribute="name" at-title="Name"></td>
                    <td at-sortable at-attribute="email" at-title="Email"></td>
                </tr>
            </tbody>
        </table>
    ```
       
    + Controller
    ```javascript
        angular.module("angular-table-restful-example")
        .controller("basicExampleCtrl", [function() {
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

   - API Pagination:
   
    + View
    ```html
        <table at-table="vm.myTableConfig" at-paginated>
            <tbody>
                <tr>    
                    <td at-sortable at-attribute="index" at-title="Index"></td>
                    <td at-sortable at-attribute="name" at-title="Name"></td>
                    <td at-sortable at-attribute="email" at-title="Email"></td>
                </tr>
            </tbody>
        </table>
    ```
    
    + Controller
        * ```vm.myTableConfig``` must have a changeEvent function that will be triggered for the API Pagination to work.
        * At the success callBack from the API call you need to treat the data, because the angular-table-restful expects to receive an Array with two more attribute (totalCount and pageNo). The ```prepareData ```function shows how to handle the data properly. Keep in mind that this treatment should be done by an [interceptor](https://docs.angularjs.org/api/ng/service/$http).
        * Also you can access a lot of the table's functionalities from your controller through the ```vm.myTableConfig``` because the angular-table-restful injects methods and attributes to it, making data manipulation easy. e.g.:
            - clearData -> Function to clear all table items.
            - hasData -> Function that verifies if the table has items.
            - refresh -> Function that updates the table and goes back to 1st page (triggers the changeEvent).
            - refreshAndKeepCurrentPage -> Same as refresh but the table stays at the current page.
            - refreshAndGoToLastPage -> Same as refresh but the table goes to the last page.
            - predicates -> List of all the current predicates of the table.
            - sortList -> List of all columns that are sorting the table.
            - currentPage -> Attribute that has the currentPage of the table
            
            - There are some other functionalities that will be useful to you when using the table but the most important are listed above.
        
    ```javascript
        angular.module("angular-table-restful-example")
        .controller("basicExampleCtrl", ['$http', function($http) {
            var vm = this;

            vm.myTableConfig = {
                changeEvent: tableChangeEvt
            };

            function tableChangeEvt(pageInfo, deferred) {
                var page = 'page' + pageInfo.pageNo + '.json';

                $http.get('api/' + page).then(function(successData){
                    var data = prepareData(successData.data);
                    deferred.resolve(data);
                }, function(errorData){
                    alert('Something went wrong with the API call :(');
                });
            }

              //This function could be an interceptor, just treat the API result
            function prepareData(data){
                var extractedData = [];

                extractedData = data.pageItems;

                //totalCount -> Total count of all items (e.g.: 3 pages with 5 items each, totalCount: 15).
                extractedData.totalCount = data.totalCount;

                //pageNo -> The page that the API will retreive (same value that the pageInfo.pageNo has).
                extractedData.pageNo = data.pageNo;

                return extractedData;
            }

        }]);
    ```
