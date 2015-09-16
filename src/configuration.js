    ColumnConfiguration = (function() {
        function ColumnConfiguration(bodyMarkup, headerMarkup, atTableConfig) {
            this.attribute = bodyMarkup.attribute;
            this.title = bodyMarkup.title;
            this.sortable = bodyMarkup.sortable;
            this.width = bodyMarkup.width;
            this.initialSorting = bodyMarkup.initialSorting;
            if (headerMarkup) {
                this.customContent = headerMarkup.customContent;
                this.attributes = headerMarkup.attributes;
            }
            this.atTableConfig = atTableConfig;
        }

        ColumnConfiguration.prototype.createElement = function() {
            var th;
            th = angular.element(document.createElement("th"));

            if (this.atTableConfig.i18nDirective) {
                return th.attr(this.atTableConfig.i18nDirective, '');
            }

            return th;
        };

        ColumnConfiguration.prototype.renderTitle = function(element) {
            return element.html(this.customContent || this.title);
        };

        ColumnConfiguration.prototype.renderAttributes = function(element) {
            var attribute, _i, _len, _ref, _results;
            if (this.attributes) {
                _ref = this.attributes;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    attribute = _ref[_i];
                    _results.push(element.attr(attribute.name, attribute.value));
                }
                return _results;
            }
        };

        ColumnConfiguration.prototype.renderSorting = function(element) {
            var icon;
            if (this.sortable) {
                element.attr("ng-click", "sort('" + this.attribute + "')");
                icon = angular.element("<i style='margin-left: 10px;'></i>");
                icon.attr("ng-class", "getSortIcon('" + this.attribute + "')");
                return element.append(icon);
            }
        };

        ColumnConfiguration.prototype.renderWidth = function(element) {
            return element.attr("width", this.width);
        };

        ColumnConfiguration.prototype.renderHtml = function() {
            var th;
            th = this.createElement();
            this.renderTitle(th);
            this.renderAttributes(th);
            this.renderSorting(th);
            this.renderWidth(th);
            return th;
        };

        return ColumnConfiguration;

    })();

    ScopeConfigWrapper = (function() {
        function ScopeConfigWrapper(scope, atTable, itemsPerPage, atPagesToShow, $q, $rootScope, $filter, atTableConfig) {
            if (angular.isDefined(itemsPerPage)) {
                if (itemsPerPage.trim() === '') {
                    itemsPerPage = atTableConfig.defaultPageSize;
                } else {
                    itemsPerPage = parseInt(itemsPerPage);
                }
            }

            var $this = this;
            this.scope = scope;
            this.$q = $q;
            this.$filter = $filter;
            this.checkedItemsList = [];

            var tableData = scope.$parent.$eval(atTable);
            scope.isMemory = false;
            if (typeof tableData === 'function') {
                tableData = {
                    changeEvent: tableData
                };
            } else if (_.isArray(tableData) || typeof tableData === 'undefined') {
                //Data in memory
                scope.isMemory = true;
                tableData = {};
            } else {
                if (tableData.checkedKey && tableData.checkedFilter) {
                    scope.hasCheck = true;
                    tableData = angular.extend(tableData, {
                        getCheckedItems: function() {
                            $this.saveCheckedItems();
                            return $this.checkedItemsList;
                        },
                        clearAllCheckedItems: function() {
                            $this.checkedItemsList = [];
                        }
                    });
                }
            }

            scope.atConfig = this.atConfig = angular.extend(tableData, {
                itemsPerPage: itemsPerPage,
                currentPage: 0,
                sortContext: 'global',
                orderBy: 'orderBy',
                listName: scope.isMemory ? atTable : 'listData',
                sortList: [],
                predicates: [],
                numberOfPages: 1,
                numberOfPagesToShow: atPagesToShow ? atPagesToShow : 5,
                getLastPage: function() {
                    //If all pages are full it means that the next item will go on a new page.
                    if (scope.sortedAndPaginatedList.totalCount % itemsPerPage === 0) {
                        return this.numberOfPages + 1;
                    }

                    return this.numberOfPages;
                },
                setSortAndPredicates: function(sort, predicates) {
                    this.sortList = sort ? sort : [];
                    this.predicates = predicates ? predicates : [];
                },
                // If not in memory
                // Sort = none and currentPage = first.
                refresh: function() {
                    $this.checkedItemsList = [];
                    $this.callChangeEvent(0, $this.atConfig.itemsPerPage, undefined, function(list) {
                        $this.setCurrentPage(0);
                        $this.atConfig.setSortAndPredicates();
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                refreshAndGoToLastPage: function() {
                    $this.callChangeEvent($this.atConfig.numberOfPages - 1, $this.atConfig.itemsPerPage, undefined, function(list) {
                        $this.setCurrentPage($this.atConfig.numberOfPages - 1);
                        $this.atConfig.setSortAndPredicates();
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                refreshAndKeepCurrentPage: function() {
                    var predicates = $this.atConfig.predicates;
                    var sortList = $this.atConfig.sortList;
                    $this.callChangeEvent($this.atConfig.currentPage, $this.atConfig.itemsPerPage, $this.atConfig.predicates, function(list) {
                        $this.setCurrentPage($this.atConfig.currentPage);
                        $this.atConfig.setSortAndPredicates(sortList, predicates);
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                hasData: function() {
                    return $this.getList() ? $this.getList().length > 0 : false;
                },
                clearData: function() {
                    scope.$eval($this.atConfig.listName + '=list', {
                        list: []
                    });
                },
                getList: function() {
                    return $this.getList() ? $this.getList().slice(0) : undefined;
                },
                checkAllItems: function(param) {
                    var currentPage = $this.getList();
                    angular.forEach(currentPage, function(obj) {
                        $this.atConfig.checkItem(obj, param);
                    });
                },
                prepareData: tableData.prepareData ? tableData.prepareData : function(data) {
                    var extractedData = data;
                    if (!_.isArray(data) && data.pageItems && data.pageNo && data.totalCount >= 0) {
                        extractedData = [];
                        extractedData = data.pageItems;
                        extractedData.totalCount = data.totalCount;
                        extractedData.pageNo = data.pageNo;
                    }
                    return extractedData;
                }
            });

            //If API paginated, atConfig data is passed to controller's atTable variable.
            if (!scope.isMemory) {
                scope.$parent.$eval(atTable + '=value', {
                    value: this.atConfig
                });
            }
        }

        ScopeConfigWrapper.prototype.getList = function() {
            return this.scope.$eval(this.atConfig.listName);
        };

        ScopeConfigWrapper.prototype.getTotalCount = function() {
            var list = this.getList();
            if (list) {
                if (this.atConfig.changeEvent) {
                    return list.totalCount;
                } else {
                    return list.length;
                }
            } else {
                return undefined;
            }
        };

        ScopeConfigWrapper.prototype.setList = function(_list) {
            this.scope.$eval(this.atConfig.listName + '=list', {
                list: _list
            });
        };

        ScopeConfigWrapper.prototype.getSortList = function() {
            return this.atConfig.sortList;
        };

        ScopeConfigWrapper.prototype.setSortList = function(sortList) {
            return this.atConfig.sortList = sortList; // jshint ignore:line
        };

        ScopeConfigWrapper.prototype.setPredicates = function(predicates) {
            return this.atConfig.predicates = predicates; // jshint ignore:line
        };

        ScopeConfigWrapper.prototype.getPredicates = function() {
            return this.atConfig.predicates;
        };

        ScopeConfigWrapper.prototype.callChangeEvent = function(page, itemsPerPage, sortList, success) {
            var $this = this;
            var deferred = this.$q.defer();
            deferred.promise.then(function(list) {
                // atribui página atual para atribuir ao scope
                // sempre que lista for atualizada por evento de paginação ou ordenação o update será chamado,
                // caso o objeto tenha o atributo pageNo esta página será atribuída ao currentPage, caso contrário será considerado como página 0,
                // para filtros pela tela resete a páginação/ordenação, pois não é executado por um promise, a atribuição é direto no list, não pasando por aqui.

                var extractedData = $this.atConfig.prepareData(list);

                if (extractedData && !extractedData.pageNo) {
                    extractedData.pageNo = page + 1;
                }

                success(extractedData);
            });

            this.atConfig.changeEvent({
                pageNo: page + 1,
                pageSize: itemsPerPage,
                sort: sortList
            }, deferred);
        };

        ScopeConfigWrapper.prototype.getItemsPerPage = function() {
            return this.atConfig.itemsPerPage;
        };

        ScopeConfigWrapper.prototype.getCurrentPage = function() {
            return this.atConfig.currentPage;
        };

        ScopeConfigWrapper.prototype.getSortContext = function() {
            return this.atConfig.sortContext;
        };

        ScopeConfigWrapper.prototype.setCurrentPage = function(currentPage) {
            return this.atConfig.currentPage = currentPage; // jshint ignore:line
        };

        ScopeConfigWrapper.prototype.getOrderBy = function() {
            return this.atConfig.orderBy;
        };

        ScopeConfigWrapper.prototype.getOrderBy = function() {
            return this.atConfig.orderBy;
        };

        ScopeConfigWrapper.prototype.getNumberOfPages = function() {
            return this.atConfig.numberOfPages;
        };

        ScopeConfigWrapper.prototype.setNumberOfPages = function(numberOfPages) {
            return this.atConfig.numberOfPages = numberOfPages; // jshint ignore:line 
        };

        ScopeConfigWrapper.prototype.getNumberOfPagesToShow = function() {
            return this.atConfig.numberOfPagesToShow;
        };

        ScopeConfigWrapper.prototype.keepItemSelected = function() {
            var selectedItem = this.atConfig ? this.atConfig.selectedItem : undefined;
            if (selectedItem) {
                angular.forEach(this.getList(), function(item) {
                    //ToDo: Alterar condição para comparar todos os atributos do selectedItem.
                    if (item.id && selectedItem.id && item.id == selectedItem.id) { // jshint ignore:line
                        selectedItem = item;
                    }
                });
                this.atConfig.selectedItem = selectedItem;
            }
        };

        ScopeConfigWrapper.prototype.saveCheckedItems = function() {
            var $this = this;
            var currentPage = this.getList();
            var filter = this.atConfig.checkedFilter();
            var key = this.atConfig.checkedKey();

            angular.forEach(currentPage, function(pageItem) {
                var checkedItemIndex = _.findIndex($this.checkedItemsList, function isInCheckedList(checkedItem) {
                    return checkedItem[key] === pageItem[key];
                });
                if (checkedItemIndex !== -1) {
                    $this.checkedItemsList.splice(checkedItemIndex, 1);
                }
            });

            var checkedItems = this.$filter('filter')(currentPage, filter);

            $this.checkedItemsList = _.union($this.checkedItemsList, checkedItems);
        };

        ScopeConfigWrapper.prototype.applyCheckedItems = function() {
            var $this = this;
            var currentPage = this.getList();
            var key = this.atConfig.checkedKey();

            angular.forEach(currentPage, function(pageItem) {
                var checkedItem = _.find($this.checkedItemsList, function isInCheckedList(checkedItem) {
                    return checkedItem[key] === pageItem[key];
                });
                if (checkedItem !== undefined) {
                    delete checkedItem.$$hashKey;
                    var checkedProperties = Object.getOwnPropertyNames(checkedItem);
                    var pageItemProperties = Object.getOwnPropertyNames(pageItem);

                    //Returns all the properties that the checkedItem has and the pageItem hasn't.
                    var differences = _.difference(checkedProperties, pageItemProperties);

                    angular.forEach(differences, function(diff) {
                        pageItem[diff] = checkedItem[diff];
                    });
                }
            });
        };

        return ScopeConfigWrapper;

    })();

    TableConfiguration = (function() {
        function TableConfiguration(tableElement, attributes, atTableConfig) {
            this.tableElement = tableElement;
            this.attributes = attributes;
            this.id = this.attributes.id;
            this.paginated = this.attributes.atPaginated != null; // jshint ignore:line
            this.list = this.attributes.atTable;
            this.atChange = this.attributes.atChange;
            this.atTableConfig = atTableConfig;
            this.createColumnConfigurations();
        }

        TableConfiguration.prototype.capitaliseFirstLetter = function(string) {
            if (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            } else {
                return "";
            }
        };

        TableConfiguration.prototype.extractWidth = function(prop) {
            var width;
            width = /([0-9]+px)/i.exec(prop);
            if (width) {
                return width[0];
            } else {
                return "";
            }
        };

        TableConfiguration.prototype.isSortable = function(classes) {
            var sortable;
            sortable = /(sortable)/i.exec(classes);
            if (sortable) {
                return true;
            } else {
                return false;
            }
        };

        TableConfiguration.prototype.getInitialSorting = function(td) {
            var initialSorting;
            initialSorting = td.attr("at-initial-sorting");
            if (initialSorting) {
                if (initialSorting === "asc" || initialSorting === "desc") {
                    return initialSorting;
                }
                throw "Invalid value for initial-sorting: " + initialSorting + ". Allowed values are 'asc' or 'desc'.";
            }
            return void 0;
        };

        TableConfiguration.prototype.collectHeaderMarkup = function(table) {
            var customHeaderMarkups, th, tr, thead, _i, _len, _ref;
            customHeaderMarkups = {};
            tr = table.find("tr");
            thead = table.find("thead");
            _ref = tr.find("th");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                th = _ref[_i];
                th = angular.element(th);
                customHeaderMarkups[th.attr("at-attribute")] = {
                    customContent: th.html(),
                    attributes: th[0].attributes
                };

                if (!thead.is('[at-ignore-header]')) {
                    th.remove();
                }
            }
            return customHeaderMarkups;
        };

        TableConfiguration.prototype.collectBodyMarkup = function(table) {
            var attribute, bodyDefinition, initialSorting, sortable, td, title, width, _i, _len, _ref;
            bodyDefinition = [];
            _ref = table.find("td");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                td = _ref[_i];
                td = angular.element(td);
                if (table.attr('at-ellipsis') !== "false") {
                    td.addClass('text-ellipsis');
                }
                attribute = td.attr("at-attribute");
                title = td.attr("at-title") || this.capitaliseFirstLetter(td.attr("at-attribute"));
                sortable = td.attr("at-sortable") !== void 0 || this.isSortable(td.attr("class"));
                width = this.extractWidth(td.attr("width") ? td.attr("width") : td.attr("class"));
                initialSorting = this.getInitialSorting(td);
                bodyDefinition.push({
                    attribute: attribute,
                    title: title,
                    sortable: sortable,
                    width: width,
                    initialSorting: initialSorting
                });
            }
            return bodyDefinition;
        };

        TableConfiguration.prototype.createColumnConfigurations = function() {
            var bodyMarkup, headerMarkup, i, _i, _len;
            headerMarkup = this.collectHeaderMarkup(this.tableElement);
            bodyMarkup = this.collectBodyMarkup(this.tableElement);
            this.columnConfigurations = [];
            for (_i = 0, _len = bodyMarkup.length; _i < _len; _i++) {
                i = bodyMarkup[_i];
                this.columnConfigurations.push(new ColumnConfiguration(i, headerMarkup[i.attribute], this.atTableConfig));
            }
        };

        return TableConfiguration;

    })();

    Setup = (function() {
        function Setup() {}

        Setup.prototype.setupTr = function(element, repeatString) {
            var tbody, tr;
            tbody = element.find("tbody");
            tr = tbody.find("tr");
            tr.attr("ng-repeat", repeatString);
            return tbody;
        };
        return Setup;
    })();

    PaginatedSetup = (function(_super) {
        __extends(PaginatedSetup, _super);

        function PaginatedSetup() {} // jshint ignore:line

        PaginatedSetup.prototype.compile = function(element) {
            var trackBy = element.attr('track-by') || '';
            if (trackBy && trackBy.trim() !== '') {
                if (trackBy.trim().indexOf('$') < 0 && trackBy.trim().indexOf('item.') < 0) {
                    trackBy = 'item.' + trackBy;
                }
                this.setupTr(element, "item in sortedAndPaginatedList track by " + trackBy);
            } else {
                this.setupTr(element, "item in sortedAndPaginatedList");
            }
        };

        PaginatedSetup.prototype.link = function($scope, $element, $attributes, $filter, $q, $rootScope, atTableConfig) {

            var getSortedAndPaginatedList, update, w, keepInBounds, updateCheckAll;
            var allCheckedStatus = false;

            w = new ScopeConfigWrapper($scope, $attributes.atTable, $attributes.atPaginated, $attributes.atPagesToShow, $q, $rootScope, $filter, atTableConfig);

            getSortedAndPaginatedList = function(list, currentPage, itemsPerPage, orderBy, sortContext, predicate, $filter) {
                var fromPage, val;
                if (list) {
                    val = list;

                    if (itemsPerPage) {
                        fromPage = itemsPerPage * currentPage - list.length;
                    }
                    if (sortContext === "global") {
                        if (predicate.length > 0) {
                            val = $filter(orderBy)(val, predicate);
                        }
                        if (itemsPerPage) {
                            val = $filter("limitTo")(val, fromPage);
                            val = $filter("limitTo")(val, itemsPerPage);
                        }
                    } else {
                        if (itemsPerPage) {
                            val = $filter("limitTo")(val, fromPage);
                            val = $filter("limitTo")(val, itemsPerPage);
                        }
                        if (predicate.length > 0) {
                            val = $filter(orderBy)(val, predicate);
                        }
                    }
                    return val;
                } else {
                    return [];
                }
            };

            // inicio paginação
            keepInBounds = function(val, min, max) {
                val = Math.max(min, val);
                return Math.min(max, val);
            };
            // fim paginação

            update = function() {
                if (w.getList()) {
                    // trecho que prepara a lista filtrada e ordenada
                    if ($scope.atConfig.changeEvent) {
                        // {length: 13, list: [object, object, object...]}
                        $scope.sortedAndPaginatedList = w.getList(); // lista de json paginado
                    } else {
                        $scope.sortedAndPaginatedList = getSortedAndPaginatedList(w.getList(), w.getCurrentPage(), w.getItemsPerPage(), w.getOrderBy(), w.getSortContext(), w.getPredicates(), $filter);
                    }
                } else {
                    $scope.sortedAndPaginatedList = null;
                }

                // inicio paginação
                if (w.getItemsPerPage()) {
                    var newNumberOfPages, numberOfPagesToShow, totalCount;
                    totalCount = w.getTotalCount();
                    var currentPage;
                    if (totalCount > 0) {
                        newNumberOfPages = Math.ceil(totalCount / w.getItemsPerPage());
                        numberOfPagesToShow = newNumberOfPages >= w.getNumberOfPagesToShow() ? w.getNumberOfPagesToShow() : newNumberOfPages;
                        w.setNumberOfPages(newNumberOfPages);
                        $scope.pageSequence.resetParameters(0, newNumberOfPages, numberOfPagesToShow);
                        w.setCurrentPage(keepInBounds(w.getCurrentPage(), 0, w.getNumberOfPages() - 1));
                        currentPage = w.getCurrentPage();
                    } else {
                        w.setNumberOfPages(1);
                        $scope.pageSequence.resetParameters(0, 1, 1);
                        w.setCurrentPage(0);
                        currentPage = 0;
                    }

                    updateCheckAll();
                    $rootScope.$broadcast('Angular-Table-Restful.TableUpdated', w.atConfig);
                    return $scope.pageSequence.realignGreedy(currentPage);
                }

                updateCheckAll();
                $rootScope.$broadcast('Angular-Table-Restful.TableUpdated', w.atConfig);
            };

            updateCheckAll = function() {
                if ($scope.hasCheck && typeof w.atConfig.onAllChecked === 'function') {
                    var currentPage = w.getList();
                    if (!currentPage || currentPage.length === 0) {
                        if (allCheckedStatus) {
                            w.atConfig.onAllChecked(false);
                            allCheckedStatus = false;
                        }
                    } else {
                        var checkedItems = $filter('filter')(currentPage, w.atConfig.checkedFilter());

                        // nextStatus => true when all items in the page are checked; false if at least one item is not;
                        var nextStatus = (checkedItems.length === currentPage.length);

                        if (nextStatus !== allCheckedStatus) {
                            w.atConfig.onAllChecked(nextStatus);
                            allCheckedStatus = nextStatus;
                        }
                    }
                }
            };

            $scope.isInitialized = function() {
                return !angular.isUndefined(w.getList()) && !angular.isUndefined(w.getTotalCount());
            };
            $scope.isEmpty = function() {
                return $scope.isInitialized() && w.getTotalCount() < 1;
            };
            $scope.getNumberOfPages = function() {
                return w.getNumberOfPages();
            };
            $scope.getCurrentPage = function() {
                return w.getCurrentPage();
            };

            // inicio eventos
            $scope.sort = function(predicate) {
                if (!w.getSortList()) {
                    return;
                }

                var _sortList = [];
                _sortList = _sortList.concat(w.getSortList());

                var result = _.find(_sortList, function(e) {
                    return e.predicate === predicate;
                });

                if (!result) {
                    _sortList.push({
                        predicate: predicate,
                        descending: true
                    });
                } else {
                    if (!result.descending) {
                        var indexObj = _sortList.indexOf(result);
                        _sortList.splice(indexObj, 1);
                    } else {
                        result.descending = false;
                    }
                }

                var _predicates = [];
                angular.forEach(_sortList, function(item) {
                    if (item.descending) {
                        _predicates.push('-' + item.predicate); //Descresente
                    } else {
                        _predicates.push(item.predicate); //Crescente
                    }
                });

                if ($scope.atConfig.changeEvent) {
                    if (w.getCurrentPage() !== 0) {
                        w.setCurrentPage(0);
                    }

                    if ($scope.hasCheck) {
                        w.saveCheckedItems();
                    }

                    w.callChangeEvent(w.getCurrentPage(), w.getItemsPerPage(), _predicates, function(list) {
                        w.setSortList(_sortList);
                        w.setPredicates(_predicates);
                        w.setList(list);
                        w.keepItemSelected();

                        if ($scope.hasCheck) {
                            w.applyCheckedItems();
                        }
                    });
                } else {
                    w.setSortList(_sortList);
                    w.setPredicates(_predicates);

                    if (w.getCurrentPage() !== 0) {
                        w.setCurrentPage(0);
                    } else {
                        update();
                    }
                }
            };

            $scope.stepPage = function(page) {
                page = parseInt(page);
                page = keepInBounds(w.getCurrentPage() + page, 0, w.getNumberOfPages() - 1);
                if ($scope.atConfig.changeEvent) {
                    if ($scope.hasCheck) {
                        w.saveCheckedItems();
                    }
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function(list) {
                        $scope.pageSequence.realignGreedy(page);
                        w.setCurrentPage(page);
                        w.setList(list);
                        w.keepItemSelected();

                        if ($scope.hasCheck) {
                            w.applyCheckedItems();
                        }
                    });
                } else {
                    $scope.pageSequence.realignGreedy(page);
                    w.setCurrentPage(page);
                }
            };

            $scope.firstPage = function() {
                return $scope.stepPage(-1);
            };

            $scope.goToPage = function(page) {
                if ($scope.atConfig.changeEvent) {
                    if ($scope.hasCheck) {
                        w.saveCheckedItems();
                    }
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function(list) {
                        w.setCurrentPage(page);
                        w.setList(list);
                        w.keepItemSelected();

                        if ($scope.hasCheck) {
                            w.applyCheckedItems();
                        }
                    });
                } else {
                    return w.setCurrentPage(page);
                }
            };
            // fim eventos

            $scope.pageSequence = new PageSequence();

            if (!$scope.atConfig.changeEvent) {
                $scope.$watch('atConfig.currentPage', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        return update();
                    }
                });
            }

            $scope.$watch('atConfig.itemsPerPage', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    if ($scope.atConfig.changeEvent) {
                        w.callChangeEvent(w.getCurrentPage(), newValue, w.getPredicates(), function(list) {
                            w.setItemsPerPage(newValue);
                            w.setList(list);
                            w.keepItemSelected();
                        });
                    } else {
                        return update();
                    }
                }
            });

            if (!$scope.atConfig.changeEvent) {
                $scope.$watch('atConfig.sortContext', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        return update();
                    }
                });
            }

            // If data is in memory, listen to the changes and update the table.
            if ($scope.isMemory) {
                $scope.$watchCollection($attributes.atTable, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        update();
                    }
                });

                // The watchCollection and the watch are necessary to distinguish between the elements of the 
                // table changing completely (as in reloading the table, or changing page) from smaller changes (e.g.: an item being checked)
                // The first will easily fall on the watchCollection, and the second below. In the second case we don't want to 
                // trigger the update function, but you may need the event broadcasted
                $scope.$watch($attributes.atTable, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $rootScope.$broadcast('Angular-Table-Restful.ListChanged', w.atConfig);
                    }
                }, true);
            }

            if (!$scope.isMemory) {
                $scope.$watch('listData', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        update();
                    }
                }, true);

                // If attr 'at-load-on-startup' or atConfig.loadOnStartup are defined
                // Invoke changeEvent func to load first page
                if ($scope.atConfig.loadOnStartup || angular.isDefined($attributes.atLoadOnStartup)) {
                    setTimeout(function() {
                        w.callChangeEvent(0, w.getItemsPerPage(), undefined, function(list) {
                            w.setList(list);
                            w.keepItemSelected();
                        });
                    }, 1);
                }
            }

            update();
        };

        return PaginatedSetup;

    })(Setup);

    Table = (function() {
        function Table(element, tableConfiguration, atTableConfig) {
            this.element = element;
            this.tableConfiguration = tableConfiguration;
            this.atTableConfig = atTableConfig;
        }

        Table.prototype.constructHeader = function() {
            var i, tr, _i, _len, _ref;
            tr = this.element.find("thead > tr");
            if (tr.length === 0) {
                tr = angular.element(document.createElement("tr"));
            }
            _ref = this.tableConfiguration.columnConfigurations;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                tr.append(i.renderHtml());
            }
            return tr;
        };

        Table.prototype.setupHeader = function() {
            var header, thead;
            thead = this.element.find("thead");
            if (thead.length === 0) {
                thead = $('<thead></thead>');
                this.element.prepend(thead);
            }

            if (!thead.is('[at-ignore-header]')) {
                header = this.constructHeader();
            }

            if (!this.element.hasClass('table')) {
                this.element.addClass("table table-bordered table-striped table-responsive table-hover");
            }

            return thead.append(header);
        };

        Table.prototype.setupFooter = function() {
            var tfoot = this.element.find('tfoot');
            if (tfoot.length === 0) {
                tfoot = $('<tfoot></tfoot>');
                this.element.append(tfoot);
            }

            var emptyTableTemp = emptyTableTemplate;

            // In case there is a special i18n directive to use, we replace the default(i18n).
            if (this.atTableConfig.i18nDirective) {
                emptyTableTemp = emptyTableTemplate.replace(/i18n/g, this.atTableConfig.i18nDirective);
            }

            // TODO Viana: ver como apresentar mensagem apenas após ajax de load for executado e permanecer sem registros
            // avaliar uso do promise
            tfoot.append(emptyTableTemp);

            if (this.tableConfiguration.paginated) {
                //Se o attr atScroll for false, não deve ser adicionado o scroll, logo a paginação fica normal.
                if (this.element.attr("at-scroll") === "false") {
                    tfoot.append(paginationTemplate);
                } else {
                    var pagination = angular.element(paginationTemplateScroll);
                    pagination.addClass('scrolled-pagination');
                    tfoot.append(pagination);
                }
            }
        };

        Table.prototype.getSetup = function() {
            return new PaginatedSetup();
        };

        Table.prototype.compile = function() {
            this.setupHeader();
            this.setupFooter();
            this.setup = this.getSetup();
            return this.setup.compile(this.element);
        };

        Table.prototype.setupInitialSorting = function($scope) {
            var bd, _i, _len, _ref, _results;
            _ref = this.tableConfiguration.columnConfigurations;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                bd = _ref[_i];
                if (bd.initialSorting) {
                    if (!bd.attribute) {
                        throw "initial-sorting specified without attribute.";
                    }
                    _results.push($scope.descending = bd.initialSorting === "desc");
                    $scope.sort(bd.attribute);
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };

        Table.prototype.post = function($scope, $element, $attributes, $filter, $q, $rootScope, atTableConfig) {
            if (!$scope.getSortIcon) {
                $scope.getSortIcon = function(predicate) {
                    var result;
                    if ($scope.atConfig.sortList && $scope.atConfig.sortList.length > 0) {
                        result = _.find($scope.atConfig.sortList, function(e) {
                            return e.predicate === predicate;
                        });
                    }

                    if (!result) {
                        return "glyphicon glyphicon-minus";
                    } else
                    if (result.descending) {
                        return "glyphicon glyphicon-chevron-down";
                    } else {
                        return "glyphicon glyphicon-chevron-up";
                    }
                };
            }

            var ret = this.setup.link($scope, $element, $attributes, $filter, $q, $rootScope, atTableConfig);

            // configura ordenação inicial, caso haja
            this.setupInitialSorting($scope);

            return ret;
        };

        return Table;

    })();

    PageSequence = (function() {
        function PageSequence(lowerBound, upperBound, start, length) {
            this.lowerBound = lowerBound != null ? lowerBound : 0; // jshint ignore:line
            this.upperBound = upperBound != null ? upperBound : 1; // jshint ignore:line
            if (start == null) { // jshint ignore:line
                start = 0;
            }
            this.length = length != null ? length : 1; // jshint ignore:line
            if (this.length > (this.upperBound - this.lowerBound)) {
                throw "sequence is too long";
            }
            this.data = this.generate(start);
        }

        PageSequence.prototype.generate = function(start) {
            var x, _i, _ref, _results;
            if (start > (this.upperBound - this.length)) {
                start = this.upperBound - this.length;
            } else if (start < this.lowerBound) {
                start = this.lowerBound;
            }
            _results = [];
            for (x = _i = start, _ref = parseInt(start) + parseInt(this.length) - 1; start <= _ref ? _i <= _ref : _i >= _ref; x = start <= _ref ? ++_i : --_i) {
                _results.push(x);
            }
            return _results;
        };

        PageSequence.prototype.resetParameters = function(lowerBound, upperBound, length) {
            this.lowerBound = lowerBound;
            this.upperBound = upperBound;
            this.length = length;
            if (this.length > (this.upperBound - this.lowerBound)) {
                throw "sequence is too long";
            }
            return this.data = this.generate(this.data[0]); // jshint ignore:line
        };

        PageSequence.prototype.relocate = function(distance) {
            var newStart;
            newStart = this.data[0] + distance;
            return this.data = this.generate(newStart, newStart + this.length); // jshint ignore:line
        };

        PageSequence.prototype.realignGreedy = function(page) {
            var newStart;

            //Se a página que está sendo navegada não existe na lista de páginas exibidas, atualizo as páginas a serem exibidas.
            if (this.data.indexOf(page) === -1) {
                newStart = page;
                return this.data = this.generate(newStart); // jshint ignore:line
            }
        };

        PageSequence.prototype.realignGenerous = function(page) {};

        return PageSequence;

    })();
    