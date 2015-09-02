/*
 angular-table-restful v1.0.0
 https://github.com/mateusmcg/angular-table-restful
*/
// author:  Mateus Cerqueira
//			Fábio Viana
// version: 1.0.0
// license:  MIT 
// homepage: http://github.com/mateusmcg/angular-table-restful
(function () {
    var ColumnConfiguration, PageSequence, PaginatedSetup, ScopeConfigWrapper, Setup, StandardSetup, Table, TableConfiguration, emptyTableTemplate, paginationTemplate, paginationTemplateScroll,
      __hasProp = {}.hasOwnProperty,
      __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

    emptyTableTemplate = '<tr ng-show="isEmpty()"><td colspan="100%"><strong class="text-warning"><i18n>Nenhum item encontrado.</i18n></strong></td></tr>';
    paginationTemplateScroll = "<div ng-show='isInitialized() && !isEmpty() && getNumberOfPages() > 1' style='margin: 0px;margin-top:10px;'><ul class='pagination'><li ng-class='{disabled: getCurrentPage() <= 0}'><a href='' ng-click='firstPage()'>&lsaquo;</a></li><li ng-if='pageSequence.data[0] > 0'><a href='' ng-click='stepPage(-atConfig.numberOfPages)'>1</a></li><li ng-if='pageSequence.data[0] > 0'><a href='' ng-click='stepPage(-(pageSequence.data.indexOf(getCurrentPage()) + atConfig.numberOfPagesToShow))'>&hellip;</a></li><li ng-class='{active: getCurrentPage() == page}' ng-repeat='page in pageSequence.data'><a href='' ng-click='goToPage(page)'>{{page + 1}}</a></li><li ng-if='pageSequence.data[pageSequence.data.length -1] < getNumberOfPages() - 1'><a href='' ng-click='stepPage(atConfig.numberOfPagesToShow - pageSequence.data.indexOf(getCurrentPage()))'>&hellip;</a></li><li ng-if='pageSequence.data[pageSequence.data.length -1] < getNumberOfPages() - 1'><a href='' ng-click='stepPage(getNumberOfPages())'>{{getNumberOfPages()}}</a></li><li ng-class='{disabled: getCurrentPage() >= getNumberOfPages() - 1}'><a href='' ng-click='stepPage(1)'>&rsaquo;</a></li></ul></div>";
    paginationTemplate = "<tr ng-show='isInitialized() && !isEmpty() && getNumberOfPages() > 1' class='at-pagination'><td colspan='100%'>" + paginationTemplateScroll + "</td></tr>";

    angular.module("angular-table", []).constant('atTableConfig', {
        i18nDirective: '',
        defaultPageSize: 10
    });
    
    ColumnConfiguration = (function () {
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

        ColumnConfiguration.prototype.createElement = function () {
            var th;
            th = angular.element(document.createElement("th"));

            if (this.atTableConfig.i18nDirective)
                return th.attr(this.atTableConfig.i18nDirective, '');

            return th;
        };

        ColumnConfiguration.prototype.renderTitle = function (element) {
            return element.html(this.customContent || this.title);
        };

        ColumnConfiguration.prototype.renderAttributes = function (element) {
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

        ColumnConfiguration.prototype.renderSorting = function (element) {
            var icon;
            if (this.sortable) {
                element.attr("ng-click", "sort('" + this.attribute + "')");
                icon = angular.element("<i style='margin-left: 10px;'></i>");
                icon.attr("ng-class", "getSortIcon('" + this.attribute + "')");
                return element.append(icon);
            }
        };

        ColumnConfiguration.prototype.renderWidth = function (element) {
            return element.attr("width", this.width);
        };

        ColumnConfiguration.prototype.renderHtml = function () {
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

    ScopeConfigWrapper = (function () {
        function ScopeConfigWrapper(scope, atTable, itemsPerPage, atPagesToShow, $q, $rootScope, atTableConfig) {
            if (angular.isDefined(itemsPerPage)) {
                if (itemsPerPage.trim() == '') {
                    itemsPerPage = atTableConfig.defaultPageSize;
                } else {
                    itemsPerPage = parseInt(itemsPerPage);
                }
            }

            var $this = this;
            this.scope = scope;
            this.$q = $q;

            var tableData = scope.$parent.$eval(atTable);
            scope.isMemory = false;
            if (typeof tableData === 'function') {
                tableData = {
                    changeEvent: tableData
                };
            } else if (typeof tableData !== 'object' || typeof tableData === 'undefined') {
                //Data in memory
                scope.isMemory = true;
                tableData = {};
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
                getLastPage: function () {
                    //If all pages are full it means that the next item will go on a new page.
                    if (scope.sortedAndPaginatedList.totalCount % itemsPerPage == 0)
                        return this.numberOfPages + 1;

                    return this.numberOfPages;
                },
                setSortAndPredicates: function (sort, predicates) {
                    this.sortList = sort ? sort : [];
                    this.predicates = predicates ? predicates : [];
                },
                // If not in memory
                // Sort = none and currentPage = first.
                refresh: function () {
                    $this.callChangeEvent(0, $this.atConfig.itemsPerPage, undefined, function (list) {
                        $this.setCurrentPage(0);
                        $this.atConfig.setSortAndPredicates();
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                refreshAndGoToLastPage: function () {
                    $this.callChangeEvent($this.atConfig.numberOfPages - 1, $this.atConfig.itemsPerPage, undefined, function (list) {
                        $this.setCurrentPage($this.atConfig.numberOfPages - 1);
                        $this.atConfig.setSortAndPredicates();
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                refreshAndKeepCurrentPage: function () {
                    var predicates = $this.atConfig.predicates;
                    var sortList = $this.atConfig.sortList;
                    $this.callChangeEvent($this.atConfig.currentPage, $this.atConfig.itemsPerPage, $this.atConfig.predicates, function (list) {
                        $this.setCurrentPage($this.atConfig.currentPage);
                        $this.atConfig.setSortAndPredicates(sortList, predicates);
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                hasData: function () {
                    return $this.getList() ? $this.getList().length > 0 : false;
                },
                clearData: function () {
                    scope.$eval($this.atConfig.listName + '=list', { list: null });
                }
            });

            //If API paginated, atConfig data is passed to controller's atTable variable.
            if (!scope.isMemory) {
                scope.$parent.$eval(atTable + '=value', { value: this.atConfig });
            }
        }

        ScopeConfigWrapper.prototype.getList = function () {
            return this.scope.$eval(this.atConfig.listName);
        };

        ScopeConfigWrapper.prototype.getTotalCount = function () {
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

        ScopeConfigWrapper.prototype.setList = function (_list) {
            this.scope.$eval(this.atConfig.listName + '=list', { list: _list });
        };

        ScopeConfigWrapper.prototype.getSortList = function () {
            return this.atConfig.sortList;
        };

        ScopeConfigWrapper.prototype.setSortList = function (sortList) {
            return this.atConfig.sortList = sortList;
        };

        ScopeConfigWrapper.prototype.setPredicates = function (predicates) {
            return this.atConfig.predicates = predicates;
        };

        ScopeConfigWrapper.prototype.getPredicates = function () {
            return this.atConfig.predicates;
        };

        ScopeConfigWrapper.prototype.callChangeEvent = function (page, itemsPerPage, sortList, success) {
            var deferred = this.$q.defer();
            deferred.promise.then(function (list) {
                // atribui página atual para atribuir ao scope
                // sempre que lista for atualizada por evento de paginação ou ordenação o update será chamado,
                // caso o objeto tenha o atributo pageNo esta página será atribuída ao currentPage, caso contrário será considerado como página 0,
                // para filtros pela tela resete a páginação/ordenação, pois não é executado por um promise, a atribuição é direto no list, não pasando por aqui.
                if (list && !list.pageNo)
                    list.pageNo = page + 1;

                success(list);
            });

            this.atConfig.changeEvent({ pageNo: page + 1, pageSize: itemsPerPage, sort: sortList }, deferred);
        };

        ScopeConfigWrapper.prototype.getItemsPerPage = function () {
            return this.atConfig.itemsPerPage;
        };

        ScopeConfigWrapper.prototype.getCurrentPage = function () {
            return this.atConfig.currentPage;
        };

        ScopeConfigWrapper.prototype.getSortContext = function () {
            return this.atConfig.sortContext;
        };

        ScopeConfigWrapper.prototype.setCurrentPage = function (currentPage) {
            return this.atConfig.currentPage = currentPage;
        };

        ScopeConfigWrapper.prototype.getOrderBy = function () {
            return this.atConfig.orderBy;
        };

        ScopeConfigWrapper.prototype.getOrderBy = function () {
            return this.atConfig.orderBy;
        };

        ScopeConfigWrapper.prototype.getNumberOfPages = function () {
            return this.atConfig.numberOfPages;
        };

        ScopeConfigWrapper.prototype.setNumberOfPages = function (numberOfPages) {
            return this.atConfig.numberOfPages = numberOfPages;
        };

        ScopeConfigWrapper.prototype.getNumberOfPagesToShow = function () {
            return this.atConfig.numberOfPagesToShow;
        };

        ScopeConfigWrapper.prototype.keepItemSelected = function () {
            var selectedItem = this.atConfig ? this.atConfig.selectedItem : undefined;
            if (selectedItem) {
                angular.forEach(this.getList(), function (item, index) {
                    //ToDo: Alterar condição para comparar todos os atributos do selectedItem.
                    if (item.id && selectedItem.id && item.id == selectedItem.id)
                        selectedItem = item;
                })
                this.atConfig.selectedItem = selectedItem;
            }
        };

        return ScopeConfigWrapper;

    })();

    TableConfiguration = (function () {
        function TableConfiguration(tableElement, attributes, atTableConfig) {
            this.tableElement = tableElement;
            this.attributes = attributes;
            this.id = this.attributes.id;
            this.paginated = this.attributes.atPaginated != null;
            this.list = this.attributes.atTable;
            this.atChange = this.attributes.atChange;
            this.createColumnConfigurations();
            this.atTableConfig = atTableConfig;
        }

        TableConfiguration.prototype.capitaliseFirstLetter = function (string) {
            if (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            } else {
                return "";
            }
        };

        TableConfiguration.prototype.extractWidth = function (classes) {
            var width;
            width = /([0-9]+px)/i.exec(classes);
            if (width) {
                return width[0];
            } else {
                return "";
            }
        };

        TableConfiguration.prototype.isSortable = function (classes) {
            var sortable;
            sortable = /(sortable)/i.exec(classes);
            if (sortable) {
                return true;
            } else {
                return false;
            }
        };

        TableConfiguration.prototype.getInitialSorting = function (td) {
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

        TableConfiguration.prototype.collectHeaderMarkup = function (table) {
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

        TableConfiguration.prototype.collectBodyMarkup = function (table) {
            var attribute, bodyDefinition, initialSorting, sortable, td, title, width, _i, _len, _ref, asRolesToShow;
            bodyDefinition = [];
            _ref = table.find("td");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                td = _ref[_i];
                td = angular.element(td);
                if (table.attr('at-ellipsis') != "false")
                    td.addClass('text-ellipsis');
                attribute = td.attr("at-attribute");
                title = td.attr("at-title") || this.capitaliseFirstLetter(td.attr("at-attribute"));
                sortable = td.attr("at-sortable") !== void 0 || this.isSortable(td.attr("class"));
                width = this.extractWidth(td.attr("class"));
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

        TableConfiguration.prototype.createColumnConfigurations = function () {
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

    Setup = (function () {
        function Setup() { }

        Setup.prototype.setupTr = function (element, repeatString) {
            var tbody, tr;
            tbody = element.find("tbody");
            tr = tbody.find("tr");
            tr.attr("ng-repeat", repeatString);
            return tbody;
        };
        return Setup;
    })();

    PaginatedSetup = (function (_super) {
        __extends(PaginatedSetup, _super);

        function PaginatedSetup() {
        }

        PaginatedSetup.prototype.compile = function (element) {
            var trackBy = element.attr('track-by') | '';
            if (trackBy && trackBy.trim() != '') {
                if (trackBy.trim().indexOf('$') < 0 && trackBy.trim().indexOf('item.') < 0) {
                    trackBy = 'item.' + trackBy;
                }
                this.setupTr(element, "item in sortedAndPaginatedList track by " + trackBy);
            } else {
                this.setupTr(element, "item in sortedAndPaginatedList");
            }
        };

        PaginatedSetup.prototype.link = function ($scope, $element, $attributes, $filter, $q, $rootScope, atTableConfig) {

            var getFillerArray, getSortedAndPaginatedList, update, w;

            w = new ScopeConfigWrapper($scope, $attributes.atTable, $attributes.atPaginated, $attributes.atPagesToShow, $q, $rootScope, atTableConfig);

            getSortedAndPaginatedList = function (list, currentPage, itemsPerPage, orderBy, sortContext, predicate, $filter) {
                var fromPage, val;
                if (list) {
                    val = list;

                    if (itemsPerPage) {
                        fromPage = itemsPerPage * currentPage - list.length;
                    }
                    if (sortContext === "global") {
                        if (predicate.length > 0)
                            val = $filter(orderBy)(val, predicate);
                        if (itemsPerPage) {
                            val = $filter("limitTo")(val, fromPage);
                            val = $filter("limitTo")(val, itemsPerPage);
                        }
                    } else {
                        if (itemsPerPage) {
                            val = $filter("limitTo")(val, fromPage);
                            val = $filter("limitTo")(val, itemsPerPage);
                        }
                        if (predicate.length > 0)
                            val = $filter(orderBy)(val, predicate);
                    }
                    return val;
                } else {
                    return [];
                }
            };

            // inicio paginação
            keepInBounds = function (val, min, max) {
                val = Math.max(min, val);
                return Math.min(max, val);
            };
            // fim paginação

            update = function () {
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
                    if (totalCount > 0) {
                        newNumberOfPages = Math.ceil(totalCount / w.getItemsPerPage());
                        numberOfPagesToShow = newNumberOfPages >= w.getNumberOfPagesToShow() ? w.getNumberOfPagesToShow() : newNumberOfPages;
                        w.setNumberOfPages(newNumberOfPages);
                        $scope.pageSequence.resetParameters(0, newNumberOfPages, numberOfPagesToShow);
                        w.setCurrentPage(keepInBounds(w.getCurrentPage(), 0, w.getNumberOfPages() - 1));
                        return $scope.pageSequence.realignGreedy(w.getCurrentPage());
                    } else {
                        w.setNumberOfPages(1);
                        $scope.pageSequence.resetParameters(0, 1, 1);
                        w.setCurrentPage(0);
                        return $scope.pageSequence.realignGreedy(0);
                    }
                }
                // fim paginação
            };

            $scope.isInitialized = function () {
                return !angular.isUndefined(w.getList()) && !angular.isUndefined(w.getTotalCount());
            };
            $scope.isEmpty = function () {
                return $scope.isInitialized() && w.getTotalCount() < 1;
            };
            $scope.getNumberOfPages = function () {
                return w.getNumberOfPages();
            };
            $scope.getCurrentPage = function () {
                return w.getCurrentPage();
            };

            // inicio eventos
            $scope.sort = function (predicate) {
                if (!w.getSortList()) {
                    return;
                }

                var _sortList = [];
                _sortList = _sortList.concat(w.getSortList());

                var result = _.find(_sortList, function (e) { return e.predicate == predicate });

                if (!result) {
                    _sortList.push({ predicate: predicate, descending: true })
                } else {
                    if (!result.descending) {
                        var indexObj = _sortList.indexOf(result);
                        _sortList.splice(indexObj, 1);
                    } else {
                        result.descending = false;
                    }
                }

                var _predicates = [];
                angular.forEach(_sortList, function (item) {
                    if (item.descending) {
                        _predicates.push('-' + item.predicate); //Descresente
                    } else {
                        _predicates.push(item.predicate); //Crescente
                    }
                });

                if ($scope.atConfig.changeEvent) {
                    if (w.getCurrentPage() != 0) {
                        w.setCurrentPage(0);
                    }

                    w.callChangeEvent(w.getCurrentPage(), w.getItemsPerPage(), _predicates, function (list) {
                        w.setSortList(_sortList);
                        w.setPredicates(_predicates);
                        w.setList(list);
                        w.keepItemSelected();
                    });
                } else {
                    w.setSortList(_sortList);
                    w.setPredicates(_predicates);

                    if (w.getCurrentPage() != 0) {
                        w.setCurrentPage(0);
                    } else {
                        update();
                    }
                }
            };

            $scope.stepPage = function (page) {
                page = parseInt(page);
                page = keepInBounds(w.getCurrentPage() + page, 0, w.getNumberOfPages() - 1);
                if ($scope.atConfig.changeEvent) {
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function (list) {
                        $scope.pageSequence.realignGreedy(page);
                        w.setCurrentPage(page);
                        w.setList(list);
                        w.keepItemSelected();
                    });
                } else {
                    $scope.pageSequence.realignGreedy(page);
                    w.setCurrentPage(page);
                }
            };

            $scope.firstPage = function () {
                return $scope.stepPage(-1);
            };

            $scope.goToPage = function (page) {
                if ($scope.atConfig.changeEvent) {
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function (list) {
                        w.setCurrentPage(page);
                        w.setList(list);
                        w.keepItemSelected();
                    });
                } else {
                    return w.setCurrentPage(page);
                }
            };
            // fim eventos

            $scope.pageSequence = new PageSequence();

            if (!$scope.atConfig.changeEvent) {
                $scope.$watch('atConfig.currentPage', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        return update();
                    }
                });
            }

            $scope.$watch('atConfig.itemsPerPage', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    if ($scope.atConfig.changeEvent) {
                        w.callChangeEvent(w.getCurrentPage(), newValue, w.getPredicates(), function (list) {
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
                $scope.$watch('atConfig.sortContext', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        return update();
                    }
                });
            }

            // If data is in memory, listen to the changes and update the table.
            if ($scope.isMemory) {
                $scope.$watchCollection($attributes.atTable, function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        update();
                    }
                });
            }

            if (!$scope.isMemory) {
                $scope.$watchCollection('listData', function (newValue, oldValue) {
                    if (newValue != oldValue)
                        update();
                });

                // If attr 'at-load-on-startup' or atConfig.loadOnStartup are defined
                // Invoke changeEvent func to load first page
                if ($scope.atConfig.loadOnStartup || angular.isDefined($attributes.atLoadOnStartup)) {
                    setTimeout(function () {
                        w.callChangeEvent(0, w.getItemsPerPage(), undefined, function (list) {
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

    Table = (function () {
        function Table(element, tableConfiguration, atTableConfig) {
            this.element = element;
            this.tableConfiguration = tableConfiguration;
            this.atTableConfig = atTableConfig;
        }

        Table.prototype.constructHeader = function () {
            var i, tr, _i, _len, _ref;
            tr = this.element.find("thead > tr");
            if (tr.length == 0) {
                tr = angular.element(document.createElement("tr"));
            }
            _ref = this.tableConfiguration.columnConfigurations;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                tr.append(i.renderHtml());
            }
            return tr;
        };

        Table.prototype.setupHeader = function () {
            var header, thead;
            thead = this.element.find("thead");
            if (thead.length == 0) {
                thead = $('<thead></thead>')
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

        Table.prototype.setupFooter = function () {
            var tfoot = this.element.find('tfoot');
            if (tfoot.length == 0) {
                tfoot = $('<tfoot></tfoot>')
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
                if (this.element.attr("at-scroll") == "false") {
                    tfoot.append(paginationTemplate);
                } else {
                    var pagination = angular.element(paginationTemplateScroll);
                    pagination.addClass('scrolled-pagination');
                    tfoot.append(pagination);
                }
            }
        };

        Table.prototype.getSetup = function () {
            return new PaginatedSetup();
        };

        Table.prototype.compile = function () {
            this.setupHeader();
            this.setupFooter();
            this.setup = this.getSetup();
            return this.setup.compile(this.element);
        };

        Table.prototype.setupInitialSorting = function ($scope) {
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

        Table.prototype.post = function ($scope, $element, $attributes, $filter, $q, $rootScope, atTableConfig) {
            if (!$scope.getSortIcon) {
                $scope.getSortIcon = function (predicate) {
                    var result;
                    if ($scope.atConfig.sortList && $scope.atConfig.sortList.length > 0) {
                        result = _.find($scope.atConfig.sortList, function (e) { return e.predicate == predicate });
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

    PageSequence = (function () {
        function PageSequence(lowerBound, upperBound, start, length) {
            this.lowerBound = lowerBound != null ? lowerBound : 0;
            this.upperBound = upperBound != null ? upperBound : 1;
            if (start == null) {
                start = 0;
            }
            this.length = length != null ? length : 1;
            if (this.length > (this.upperBound - this.lowerBound)) {
                throw "sequence is too long";
            }
            this.data = this.generate(start);
        }

        PageSequence.prototype.generate = function (start) {
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

        PageSequence.prototype.resetParameters = function (lowerBound, upperBound, length) {
            this.lowerBound = lowerBound;
            this.upperBound = upperBound;
            this.length = length;
            if (this.length > (this.upperBound - this.lowerBound)) {
                throw "sequence is too long";
            }
            return this.data = this.generate(this.data[0]);
        };

        PageSequence.prototype.relocate = function (distance) {
            var newStart;
            newStart = this.data[0] + distance;
            return this.data = this.generate(newStart, newStart + this.length);
        };

        PageSequence.prototype.realignGreedy = function (page) {
            var newStart;

            //Se a página que está sendo navegada não existe na lista de páginas exibidas, atualizo as páginas a serem exibidas.
            if (this.data.indexOf(page) == -1) {
                newStart = page;
                return this.data = this.generate(newStart);
            }
        };

        PageSequence.prototype.realignGenerous = function (page) { };

        return PageSequence;

    })();
    
    angular.module("angular-table").directive("atTable", ["$filter", '$q', '$rootScope', '$compile', 'atTableConfig', function ($filter, $q, $rootScope, $compile, atTableConfig) {
        return {
            restrict: "AC",
            scope: true,
            compile: function (element, attributes, transclude) {
                var table, tc;

                var trElement = angular.element(element.find('tbody').find('tr'));

                if ('ng-click' in trElement[0].attributes) {
                    trElement[0].attributes['ng-click'].value = trElement[0].attributes['ng-click'].value.concat('; markSelected(item)');
                } else {
                    trElement.attr('ng-click', 'markSelected(item)');
                }

                trElement.attr('ng-class', "{'table-selected-row' : item == atConfig.selectedItem}");

                tc = new TableConfiguration(element, attributes, atTableConfig);
                table = new Table(element, tc, atTableConfig);
                table.compile();
                return {
                    post: function ($scope, $element, $attributes) {
                        table.post($scope, $element, $attributes, $filter, $q, $rootScope, atTableConfig);

                        $scope.markSelected = function (item) {
                            if (this.atConfig.selectedItem != item) {
                                this.atConfig.selectedItem = item;
                                return;
                            }

                            this.atConfig.selectedItem = undefined;
                        };

                        if ($attributes.atScroll != "false") {
                            var scroll = angular.element('<div class="table-scroll"></div>');
                            $element.before(scroll);
                            scroll.append($element);
                            var pagination = $element.find('.scrolled-pagination');
                            pagination.insertAfter(scroll).addClass('text-center');

                            function destroy() {
                                var s = scroll;
                                var p = pagination;
                                scroll = null;
                                pagination = null;

                                if (s) {
                                    s.remove();
                                }

                                if (p) {
                                    p.remove();
                                }
                            };

                            //// destroy
                            //// se escopo destruido remove elementos
                            $scope.$on('$destroy', function (ev) {
                                destroy();
                            });

                            //// se a table for destruida remove demais elementos
                            $element.on('$destroy', function (ev) {
                                destroy();
                            });
                        }
                    }
                };
            }
        };
    }]);

    angular.module("angular-table").directive("atAttribute", [function () {
        return {
            restrict: "A",
            compile: function (element, attributes, transclude) {
                var attribute;
                attribute = element.attr("at-attribute");
                if (!attribute) {
                    throw "at-attribute specified without value: " + (element.html());
                }
                if (element.children().length == 0) {
                    if (attributes.atFilter) {
                        return element.append("{{item." + attribute + " | " + attributes.atFilter + "}}");
                    } else {
                        return element.append("{{item." + attribute + "}}");
                    }
                }
            }
        };
    }]);

}).call(this);