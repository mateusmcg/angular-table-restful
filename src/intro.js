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
    