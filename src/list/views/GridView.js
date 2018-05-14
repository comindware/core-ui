//@flow
/* eslint-disable no-param-reassign */

import { htmlHelpers } from 'utils';
import template from '../templates/grid.hbs';
import ListView from './CollectionView';
import RowView from './RowView';
import SelectionPanelView from './SelectionPanelView';
import SelectionCellView from './SelectionCellView';
import GridHeaderView from './GridHeaderView';
import NoColumnsDefaultView from './NoColumnsView';
import LoadingChildView from './LoadingRowView';
import ToolbarView from '../../components/toolbar/ToolbarView';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import SearchBarView from '../../views/SearchBarView';

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
    gridHeaderHeight: 30
};

/**
 * @name GridView
 * @memberof module:core.list.views
 * @class GridView
 * @constructor
 * @description View-контейнер для заголовка и контента
 * @extends Marionette.View
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
 * @param {Boolean} options.useDefaultRowView использовать RowView по умолчанию.
 * В случае, если true — обязательно должны быть указаны cellView для каждой колонки
 * @param {Boolean} options.forbidSelection запретить выделять элементы списка при помощи мыши
 * */

export default Marionette.View.extend({
    initialize(options) {
        if (this.collection === undefined) {
            throw new Error('You must provide a collection to display.');
        }

        if (options.columns === undefined) {
            throw new Error('You must provide columns definition ("columns" option)');
        }

        options.onColumnSort && (this.onColumnSort = options.onColumnSort); //jshint ignore:line

        this.uniqueId = _.uniqueId('native-grid');
        this.styleSheet = document.createElement('style');

        const HeaderView = this.options.headerView || GridHeaderView;

        this.headerView = new HeaderView({
            columns: options.columns,
            gridEventAggregator: this,
            checkBoxPadding: options.checkBoxPadding || 0,
            gridColumnHeaderView: options.gridColumnHeaderView,
            styleSheet: this.styleSheet,
            uniqueId: this.uniqueId,
            isTree: this.options.isTree,
            expandOnShow: options.expandOnShow
        });

        this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);

        if (options.noColumnsView) {
            this.noColumnsView = options.noColumnsView;
        } else {
            this.noColumnsView = NoColumnsDefaultView;
        }
        options.noColumnsViewOptions && (this.noColumnsViewOptions = options.noColumnsViewOptions); // jshint ignore:line

        if (!options.draggable) {
            this.forbidSelection = typeof options.forbidSelection === 'boolean' ? options.forbidSelection : true;
        }
        const childView = options.childView || RowView;

        const showRowIndex = this.getOption('showRowIndex');

        const childViewOptions = Object.assign(options.childViewOptions || {}, {
            columns: options.columns,
            gridEventAggregator: this,
            uniqueId: this.uniqueId,
            isTree: this.options.isTree
        });

        this.isEditable = options.columns.some(column => column.editable);
        if (this.isEditable) {
            this.editableCellsIndexes = [];
            this.options.columns.forEach((column, index) => {
                if (column.editable) {
                    this.editableCellsIndexes.push(index);
                }
            });
            this.listenTo(this.collection, 'move:left', () => this.__onCursorMove(-1));
            this.listenTo(this.collection, 'move:right', () => this.__onCursorMove(+1));
            this.listenTo(this.collection, 'select:some select:one', () => this.__onCursorMove(0));
        }

        this.listView = new ListView({
            collection: this.collection,
            gridEventAggregator: this,
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
            forbidSelection: this.forbidSelection,
            isTree: this.options.isTree,
            isEditable: this.isEditable,
            showRowIndex
        });

        if (this.options.showSelection) {
            const draggable = this.getOption('draggable');
            this.selectionPanelView = new SelectionPanelView({
                collection: this.listView.collection,
                gridEventAggregator: this,
                showRowIndex: this.options.showRowIndex,
                childViewOptions: {
                    draggable,
                    showRowIndex,
                    bindSelection: this.getOption('bindSelection')
                }
            });

            this.selectionHeaderView = new SelectionCellView({
                collection: this.collection,
                selectionType: 'all',
                gridEventAggregator: this,
                showRowIndex
            });

            if (draggable) {
                this.listenTo(this.selectionPanelView, 'childview:drag:drop', (...args) => this.trigger('drag:drop', ...args));
                this.listenTo(this.selectionHeaderView, 'drag:drop', (...args) => this.trigger('drag:drop', ...args));
            }
        }

        this.listenTo(this.listView, 'all', (eventName, view, eventArguments) => {
            if (eventName.startsWith('childview')) {
                this.trigger.apply(this, [eventName, view].concat(eventArguments));
            }
        });

        if (this.collection.length) {
            //this.__presortCollection(options.columns); TODO WFT
        }
        this.collection = options.collection;

        if (options.showToolbar) {
            this.toolbarView = new ToolbarView({
                allItemsCollection: options.actions || new Backbone.Collection()
            });
            this.listenTo(this.toolbarView, 'command:execute', this.__executeAction);
        }
        if (options.showSearch) {
            this.searchView = new SearchBarView();
            this.listenTo(this.searchView, 'search', this.__onSearch);
        }
    },

    __onCursorMove(delta) {
        const currentSelectedIndex = this.editableCellsIndexes.indexOf(this.pointedCell);
        const newPosition = Math.min(this.editableCellsIndexes.length - 1, Math.max(0, currentSelectedIndex + delta));
        const newSelectedIndex = this.editableCellsIndexes[newPosition];
        this.pointedCell = newSelectedIndex;
        const pointed = this.collection.find(model => model.cid === this.collection.cursorCid);
        if (pointed) {
            pointed.trigger('select:pointed', this.pointedCell);
        }
    },

    onColumnSort(column, comparator) {
        this.collection.comparator = comparator;
        this.collection.sort();
    },

    regions: {
        headerRegion: '.js-grid-header-view',
        contentRegion: '.js-grid-content-view',
        selectionPanelRegion: '.js-grid-selection-panel-view',
        selectionHeaderRegion: '.js-grid-selection-header-view',
        noColumnsViewRegion: '.js-nocolumns-view-region',
        toolbarRegion: '.js-grid-tools-toolbar-region',
        searchRegion: '.js-grid-tools-search-region',
        loadingRegion: '.js-loading-region'
    },

    ui: {
        title: '.js-grid-title',
        tools: '.js-grid-tools',
        header: '.js-grid-header',
        content: '.js-grid-content'
    },

    events: {
        dragleave: '__handleDragLeave'
    },

    className: 'fr-collection',

    template: Handlebars.compile(template),

    behaviors: {
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion'
        }
    },

    onRender() {
        if (this.options.columns.length === 0) {
            const noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
            this.noColumnsViewRegion.show(noColumnsView);
        }

        this.showChildView('contentRegion', this.listView);

        if (this.options.showHeader) {
            this.showChildView('headerRegion', this.headerView);
        }

        if (this.options.showSelection) {
            this.showChildView('selectionHeaderRegion', this.selectionHeaderView);
            this.showChildView('selectionPanelRegion', this.selectionPanelView);
            if (this.getOption('showRowIndex')) {
                this.getRegion('selectionHeaderRegion').el.classList.add('cell_selection-index');
            }
        }

        if (this.options.showToolbar) {
            this.showChildView('toolbarRegion', this.toolbarView);
        }
        if (this.options.showSearch) {
            this.showChildView('searchRegion', this.searchView);
        }
        if (!(this.options.showToolbar || this.options.showSearch)) {
            this.ui.tools.hide();
        }

        if (this.getOption('title')) {
            this.ui.title.text(this.getOption('title') || '');
        } else {
            this.ui.title.hide();
        }
        this.updatePosition = this.listView.updatePosition.bind(this.listView.collectionView);
    },

    onAttach() {
        if (this.forbidSelection) {
            htmlHelpers.forbidSelection(this.el);
        }
        document.body.appendChild(this.styleSheet);
        this.__bindListRegionScroll();
        if (this.options.showSearch) {
            this.searchView.focus();
        }
        this.ui.content.css('maxHeight', window.innerHeight);
        // if (this.collection.visibleLength) {
        //     this.collection.select(this.collection.at(0), false, false, false);
        // }
    },

    __executeAction(actionKind) {
        this.trigger('execute:action', actionKind);
    },

    __onSearch(text) {
        this.trigger('search', text);
        if (this.options.isTree) {
            this.trigger('toggle:collapse:all', !text && !this.options.expandOnShow);
        }
    },

    __bindListRegionScroll() {
        const headerRegionEl = this.getRegion('headerRegion').el;
        const selectionPanelRegionEl = this.options.showSelection && this.getRegion('selectionPanelRegion').el;

        this.getRegion('contentRegion').el.addEventListener('scroll', event => {
            headerRegionEl.scrollLeft = event.currentTarget.scrollLeft;
            if (selectionPanelRegionEl) {
                selectionPanelRegionEl.scrollTop = event.currentTarget.scrollTop;
            }
        });
    },

    onDestroy() {
        //this.styleSheet && document.body.removeChild(this.styleSheet);
    },

    sortBy(columnIndex, sorting) {
        const column = this.options.columns[columnIndex];
        if (sorting) {
            this.options.columns.forEach(c => (c.sorting = null));
            column.sorting = sorting;

            switch (sorting) {
                case 'asc':
                    this.collection.comparator = column.sortAsc;
                    break;
                case 'desc':
                    this.collection.comparator = column.sortDesc;
                    break;
                default:
                    break;
            }
        } else {
            sorting = column.sorting;
            this.options.columns.forEach(c => (c.sorting = null));

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

    setLoading(state) {
        if (!this.isDestroyed()) {
            this.loading.setLoading(state);
        }
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
    },

    __handleDragLeave(e) {
        if (!this.el.contains(e.relatedTarget)) {
            if (this.collection.dragoverModel) {
                this.collection.dragoverModel.trigger('dragleave');
            } else {
                this.collection.trigger('dragleave:head');
            }
            this.collection.dragoverModel = null;
        }
    }
});
