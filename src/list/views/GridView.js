/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers, htmlHelpers } from 'utils';
import template from '../templates/grid.hbs';
import ListView from './ListView';
import RowView from './RowView';
import GridHeaderView from './GridHeaderView';
import NoColumnsDefaultView from './NoColumnsView';
import LoadingChildView from './LoadingRowView';

/*
    Public interface:

    This view produce:
        trigger: positionChanged (sender, { oldPosition, position })
        trigger: viewportHeightChanged (sender, { oldViewportHeight, viewportHeight })
    This view react on:
        collection change (via Backbone.Collection events)
        position change (when we scroll with scrollbar for example): updatePosition(newPosition)
 */

const constants = {
    gridRowHeight: 32,
    gridHeaderHeight: 51
};

/**
 * @name GridView
 * @memberof module:core.list.views
 * @class GridView
 * @constructor
 * @description View-контейнер для заголовка и контента
 * @extends Marionette.LayoutView
 * @param {Object} options Constructor options
 * @param {Array} options.collection массив элементов списка
 * @param {Array} options.columns массив колонок
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк)
 * @param {Number} options.childHeight высота строки списка (childView)
 * @param {Backbone.View} [options.childView] view строки списка
 * @param {Backbone.View} [options.childViewOptions] опции для childView
 * @param {Function} options.childViewSelector ?
 * @param {Object} [options.emptyViewOptions] опции для emptyView
 * @param {Backbone.View} options.gridColumnHeaderView View заголовка списка
 * @param {String} options.height задает как определяется высота строки, значения: fixed, auto
 * @param {Backbone.View} [options.loadingChildView] view-лоадер, показывается при подгрузке строк
 * @param {Backbone.View} options.noColumnsView View для отображения списка без колонок
 * @param {Object} [options.noColumnsViewOptions] опции для noColumnsView
 * @param {Number} options.maxRows максимальное количество отображаемых строк (используется с опцией height: auto)
 * @param {Boolean} options.useDefaultRowView использовать RowView по умолчанию. В случае, если true — обязательно должны быть указаны cellView для каждой колонки
 * @param {Boolean} options.forbidSelection запретить выделять элементы списка при помощи мыши
 * */
const GridView = Marionette.LayoutView.extend({
    initialize(options) {
        if (this.collection === undefined) {
            throw 'You must provide a collection to display.';
        }

        if (options.columns === undefined) {
            throw 'You must provide columns definition ("columns" option)';
        }

        options.onColumnSort && (this.onColumnSort = options.onColumnSort); //jshint ignore:line

        this.headerView = new GridHeaderView({
            columns: options.columns,
            gridEventAggregator: this,
            gridColumnHeaderView: options.gridColumnHeaderView
        });

        this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);

        if (options.noColumnsView) {
            this.noColumnsView = options.noColumnsView;
        } else {
            this.noColumnsView = NoColumnsDefaultView;
        }
        options.noColumnsViewOptions && (this.noColumnsViewOptions = options.noColumnsViewOptions); // jshint ignore:line

        this.forbidSelection = _.isBoolean(options.forbidSelection) ? options.forbidSelection : true;

        let childView = options.childView;
        if (options.useDefaultRowView) {
            _.each(options.columns, column => {
                if (column.cellView === undefined) { throw 'You must specify cellView for each column (useDefaultRowView flag is true)'; }
            });

            childView = RowView;
            options.childHeight = constants.gridRowHeight;
        } else if (options.childHeight === undefined) {
            throw 'You must provide a childHeight for the child item view (in pixels).';
        }

        const childViewOptions = _.extend(options.childViewOptions || {}, {
            columns: options.columns,
            gridEventAggregator: this
        });

        this.listView = new ListView({
            collection: this.collection,
            childView,
            childViewSelector: options.childViewSelector,
            emptyView: options.emptyView,
            emptyViewOptions: options.emptyViewOptions,
            noColumnsView: options.noColumnsView,
            noColumnsViewOptions: options.noColumnsViewOptions,
            childHeight: options.childHeight,
            childViewOptions,
            loadingChildView: options.loadingChildView || LoadingChildView,
            maxRows: options.maxRows,
            height: options.height,
            forbidSelection: this.forbidSelection
        });

        this.listenTo(this.listView, 'all', (eventName, view, eventArguments) => {
            if (_.string.startsWith(eventName, 'childview')) {
                this.trigger.apply(this, [eventName, view ].concat(eventArguments));
            }
        });

        this.listenTo(this.listView, 'positionChanged', (sender, args) => {
            this.trigger('positionChanged', this, args);
        });

        this.listenTo(this.listView, 'viewportHeightChanged', this.__updateHeight, this);

        this.updatePosition = this.listView.updatePosition.bind(this.listView);
        if (this.collection.length) {
            this.__presortCollection(options.columns);
        }
    },

    __updateHeight(sender, args) {
        args.gridHeight = args.listViewHeight + constants.gridHeaderHeight;
        this.$el.height(args.gridHeight);
        this.trigger('viewportHeightChanged', this, args);
    },

    onColumnSort(column, comparator) {
        this.collection.comparator = comparator;
        this.collection.sort();
    },

    regions: {
        headerRegion: '.grid-header-view',
        contentViewRegion: '.grid-content-view',
        noColumnsViewRegion: '.js-nocolumns-view-region'
    },

    className: 'grid',

    template: Handlebars.compile(template),

    onShow() {
        const elementWidth = this.$el.width();
        if (this.options.columns.length === 0) {
            const noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
            this.noColumnsViewRegion.show(noColumnsView);
        }
        this.headerRegion.show(this.headerView);
        this.contentViewRegion.show(this.listView);
        const updatedElementWidth = this.$el.width();
        if (elementWidth !== updatedElementWidth) {
            // A native scrollbar was displayed after we showed the content, which triggered width change and requires from us to recalculate the columns.
            this.headerView.handleResize();
            this.listView.handleResize();
        }
    },

    onRender() {
        if (this.forbidSelection) {
            htmlHelpers.forbidSelection(this.el);
        }
    },

    sortBy(columnIndex, sorting) {
        const column = this.options.columns[columnIndex];
        if (sorting) {
            _.each(this.options.columns, c => {
                c.sorting = null;
            });
            column.sorting = sorting;
            switch (sorting) {
                case 'asc':
                    this.collection.comparator = column.sortAsc;
                    break;
                case 'desc':
                    this.collection.comparator = column.sortDesc;
                    break;
            }
        } else {
            sorting = column.sorting;
            _.each(this.options.columns, c => {
                c.sorting = null;
            });
            switch (sorting) {
                case 'asc':
                    column.sorting = 'desc';
                    this.collection.comparator = column.sortDesc;
                    break;
                case 'desc':
                    column.sorting = 'asc';
                    this.collection.comparator = column.sortAsc;
                    break;
                default:
                    column.sorting = 'asc';
                    this.collection.comparator = column.sortAsc;
                    break;
            }
        }
        this.onColumnSort(column, this.collection.comparator);
        this.headerView.updateSorting();
    },

    handleResize() {
        this.headerView.handleResize();
    },

    __presortCollection(columns) {
        const sortingColumn = columns.find(column => column.sorting);
        if (sortingColumn) {
            if (sortingColumn.sorting === 'asc') {
                this.onColumnSort(sortingColumn, sortingColumn.sortAsc);
            } else {
                this.onColumnSort(sortingColumn, sortingColumn.sortDesc);
            }
        }
    }
});

export default GridView;
