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
    paginationTemplateScroll = "<div style='margin: 0px;'><ul class='pagination'><li ng-class='{disabled: getCurrentPage() <= 0}'><a href='' ng-click='firstPage()'>&lsaquo;</a></li><li ng-if='pageSequence.data[0] > 0'><a href='' ng-click='stepPage(-atConfig.numberOfPages)'>1</a></li><li ng-if='pageSequence.data[0] > 0'><a href='' ng-click='goToPage(getCurrentPage() + 1 <= 10 ? 0 : getCurrentPage() - 10)'>&hellip;</a></li><li ng-class='{active: getCurrentPage() == page}' ng-repeat='page in pageSequence.data'><a href='' ng-click='goToPage(page)'>{{page + 1}}</a></li><li ng-if='pageSequence.data[pageSequence.data.length -1] < getNumberOfPages() - 1'><a href='' ng-click='goToPage(getCurrentPage() + 1 + 10 > getNumberOfPages() ? getNumberOfPages() - 1 : atConfig.currentPage + 10)'>&hellip;</a></li><li ng-if='pageSequence.data[pageSequence.data.length -1] < getNumberOfPages() - 1'><a href='' ng-click='stepPage(getNumberOfPages())'>{{getNumberOfPages()}}</a></li><li ng-class='{disabled: getCurrentPage() >= getNumberOfPages() - 1}'><a href='' ng-click='stepPage(1)'>&rsaquo;</a></li></ul></div>";
    paginationTemplate = "<tr ng-show='isInitialized() && !isEmpty()' class='at-pagination'><td colspan='100%'>" + paginationTemplateScroll + "</td></tr>";

    angular.module("angular-table", []);

ColumnConfiguration = (function () {
        function ColumnConfiguration(bodyMarkup, headerMarkup) {
            this.attribute = bodyMarkup.attribute;
            this.title = bodyMarkup.title;
            this.sortable = bodyMarkup.sortable;
            this.width = bodyMarkup.width;
            this.initialSorting = bodyMarkup.initialSorting;
            if (headerMarkup) {
                this.customContent = headerMarkup.customContent;
                this.attributes = headerMarkup.attributes;
            }

            if (bodyMarkup.asRolesToShow) {
                if (!this.attributes) {
                    this.attributes = [];
                }
                this.attributes.push({ name: 'as-roles-to-show', value: bodyMarkup.asRolesToShow });
            }
        }

        ColumnConfiguration.prototype.createElement = function () {
            var th;
            return th = angular.element(document.createElement("th"));
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
        function ScopeConfigWrapper(scope, listName, changeEvent, itemsPerPage, $q, $rootScope) {
            if (angular.isDefined(itemsPerPage)) {
                if (itemsPerPage.trim() == '') {
                    itemsPerPage = $rootScope.appContext && $rootScope.appContext.defaultPageSize ? $rootScope.appContext.defaultPageSize : 10;
                } else {
                    itemsPerPage = parseInt(itemsPerPage);
                }
            }

            this.scope = scope;
            this.$q = $q;
            scope.atConfig = this.atConfig = {
                itemsPerPage: itemsPerPage,
                currentPage: 0,
                sortContext: 'global',
                orderBy: 'orderBy',
                changeEvent: changeEvent ? this.scope.$eval(changeEvent) : undefined,
                listName: listName,
                sortList: [],
                predicates: [],
                numberOfPages: 1,
                numberOfPagesToShow: 10
            };
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
                if (list) list.pageNo = page;
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

        return ScopeConfigWrapper;

    })();

    TableConfiguration = (function () {
        function TableConfiguration(tableElement, attributes) {
            this.tableElement = tableElement;
            this.attributes = attributes;
            this.id = this.attributes.id;
            this.paginated = this.attributes.atPaginated != null;
            this.list = this.attributes.atTable;
            this.atChange = this.attributes.atChange;
            this.createColumnConfigurations();
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
            var customHeaderMarkups, th, tr, _i, _len, _ref;
            customHeaderMarkups = {};
            tr = table.find("tr");
            _ref = tr.find("th");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                th = _ref[_i];
                th = angular.element(th);
                customHeaderMarkups[th.attr("at-attribute")] = {
                    customContent: th.html(),
                    attributes: th[0].attributes
                };
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
                attribute = td.attr("at-attribute");
                title = td.attr("at-title") || this.capitaliseFirstLetter(td.attr("at-attribute"));
                sortable = td.attr("at-sortable") !== void 0 || this.isSortable(td.attr("class"));
                width = this.extractWidth(td.attr("class"));
                initialSorting = this.getInitialSorting(td);
                asRolesToShow = td.attr('as-roles-to-show');
                bodyDefinition.push({
                    attribute: attribute,
                    title: title,
                    sortable: sortable,
                    width: width,
                    initialSorting: initialSorting,
                    asRolesToShow: asRolesToShow
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
                this.columnConfigurations.push(new ColumnConfiguration(i, headerMarkup[i.attribute]));
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
            var trackBy = element.attr('track-by') ? 'item.' + element.attr('track-by') : "$index";
            this.setupTr(element, "item in sortedAndPaginatedList track by " + trackBy);
        };

        PaginatedSetup.prototype.link = function ($scope, $element, $attributes, $filter, $q, $rootScope) {                       

            var getFillerArray, getSortedAndPaginatedList, update, w;

            w = new ScopeConfigWrapper($scope, $attributes.atTable, $attributes.atChange, $attributes.atPaginated, $q, $rootScope);

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
                    if ($attributes.atChange) {
                        // {length: 13, list: [object, object, object...]}
                        $scope.sortedAndPaginatedList = w.getList(); // lista de json paginado
                    } else {
                        $scope.sortedAndPaginatedList = getSortedAndPaginatedList(w.getList(), w.getCurrentPage(), w.getItemsPerPage(), w.getOrderBy(), w.getSortContext(), w.getPredicates(), $filter);
                    }
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

                if ($attributes.atChange) {
                    if (w.getCurrentPage() != 0) {
                        w.setCurrentPage(0);
                    }

                    w.callChangeEvent(w.getCurrentPage(), w.getItemsPerPage(), _predicates, function (list) {
                        w.setSortList(_sortList);
                        w.setPredicates(_predicates);
                        w.setList(list);
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
                if ($attributes.atChange) {
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function (list) {
                        $scope.pageSequence.realignGreedy(page);
                        w.setCurrentPage(page);
                        w.setList(list);
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
                if ($attributes.atChange) {
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function (list) {
                        w.setCurrentPage(page);
                        w.setList(list);
                    });
                } else {
                    return w.setCurrentPage(page);
                }
            };
            // fim eventos

            $scope.pageSequence = new PageSequence();

            if (!$attributes.atChange) {
                $scope.$watch('atConfig.currentPage', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        return update();
                    }
                });
            }

            $scope.$watch('atConfig.itemsPerPage', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    if ($attributes.atChange) {
                        w.callChangeEvent(w.getCurrentPage(), newValue, w.getPredicates(), function (list) {
                            w.setItemsPerPage(newValue);
                            w.setList(list);
                        });
                    } else {
                        return update();
                    }
                }
            });

            if (!$attributes.atChange) {
                $scope.$watch('atConfig.sortContext', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        return update();
                    }
                });
            }

            $scope.$watchCollection($attributes.atTable, function (newValue, oldValue) {
                if (newValue != oldValue) {
                    if ($attributes.atChange) {
                        // se houver evento change (quando houver api), reseta pagina que será reatribuída caso haja valor no newValue.pageNo (atribuído no changeEvent)
                        w.setCurrentPage(newValue && newValue.pageNo ? newValue.pageNo : 0);
                    }
                    return update();
                }
            });

            update();

            // carrega grid caso tenha o atributo at-load
            if (angular.isDefined($attributes.atLoad) && $attributes.atChange) {
                setTimeout(function () {
                    w.callChangeEvent(0, w.getItemsPerPage(), undefined, function (list) {
                        w.setList(list);
                    });
                }, 1);
            }
        };

        return PaginatedSetup;

    })(Setup);

    Table = (function () {
        function Table(element, tableConfiguration) {
            this.element = element;
            this.tableConfiguration = tableConfiguration;
        }

        Table.prototype.constructHeader = function () {
            var i, tr, _i, _len, _ref;
            tr = angular.element(document.createElement("tr"));
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
            header = this.constructHeader();

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

            // TODO Viana: ver como apresentar mensagem apenas após ajax de load for executado e permanecer sem registros
            // avaliar uso do promise
            tfoot.append(emptyTableTemplate);

            if (this.tableConfiguration.paginated) {
                if (this.element.attr("at-scroll") == undefined) {
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

        Table.prototype.post = function ($scope, $element, $attributes, $filter, $q, $rootScope) {
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

            var ret = this.setup.link($scope, $element, $attributes, $filter, $q, $rootScope);

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
            if (page < this.data[0]) {
                newStart = page;
                return this.data = this.generate(newStart);
            } else if (page > this.data[this.length - 1]) {
                newStart = page - (this.length - 1);                
                return this.data = this.generate(newStart);
            }
        };

        PageSequence.prototype.realignGenerous = function (page) { };

        return PageSequence;

    })();
angular.module("angular-table").directive("atTable", ["$filter", '$q', '$rootScope', '$compile', function ($filter, $q, $rootScope, $compile) {
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
                
                trElement.attr('ng-class', "{'table-selected-row' : item == selectedIndex}");

                tc = new TableConfiguration(element, attributes);
                table = new Table(element, tc);
                table.compile();
                return {
                    post: function ($scope, $element, $attributes) {
                        table.post($scope, $element, $attributes, $filter, $q, $rootScope);

                        $scope.selectedIndex = undefined;
                        $scope.markSelected = function (item) {
                            if ($scope.selectedIndex != item) {
                                $scope.selectedIndex = item;
                                return;
                            }

                            $scope.selectedIndex = undefined;
                        };

                        if ($attributes.atScroll != undefined) {
                            var scroll = angular.element('<div class="table-scroll"></div>');
                            $element.before(scroll);
                            scroll.append($element);
                            $element.find('.scrolled-pagination').insertAfter(scroll).addClass('text-center');
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