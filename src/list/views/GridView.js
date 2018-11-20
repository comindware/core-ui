//@flow
/* eslint-disable no-param-reassign */

import form from 'form';
import { columnWidthByType } from '../meta';
import template from '../templates/grid.hbs';
import ListView from './CollectionView';
import RowView from './RowView';
import SelectionPanelView from './selections/SelectionPanelView';
import SelectionCellView from './selections/SelectionCellView';
import GridHeaderView from './header/GridHeaderView';
import LoadingChildView from './LoadingRowView';
import ToolbarView from '../../components/toolbar/ToolbarView';
import MobileService from '../../services/MobileService';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import SearchBarView from '../../views/SearchBarView';
import ConfigurationPanel from './ConfigurationPanel';
import transliterator from 'utils/transliterator';
import EmptyGridView from '../views/EmptyGridView';

/*
    Public interface:

    This view produce:
        trigger: positionChanged (sender, { oldPosition, position })
        trigger: viewportHeightChanged (sender, { oldViewportHeight, viewportHeight })
    This view react on:
        collection change (via Backbone.Collection events)
        position change (when we scroll with scrollbar for example): updatePosition(newPosition)
 */

const defaultOptions = options => ({
    focusSearchOnAttach: !MobileService.isMobile,
    emptyView: EmptyGridView,
    emptyViewOptions: {
        text: () => (options.columns.length ? Localizer.get('CORE.GRID.EMPTYVIEW.EMPTY') : Localizer.get('CORE.GRID.NOCOLUMNSVIEW.ALLCOLUMNSHIDDEN'))
    }
});

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
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк) или не инициализированы колонки.
 * @param {Number} options.childHeight высота строки списка (childView)
 * @param {Number} options.maxHeight максимальная высота всего списка
 * @param {Backbone.View} [options.childView] view строки списка
 * @param {Backbone.View} [options.childViewOptions] опции для childView
 * @param {Function} options.childViewSelector ?
 * @param {Object} [options.emptyViewOptions] опции для emptyView
 * @param {String} options.height задает как определяется высота строки, значения: fixed, auto
 * @param {Backbone.View} [options.loadingChildView] view-лоадер, показывается при подгрузке строк
 * @param {Number} options.maxRows максимальное количество отображаемых строк (используется с опцией height: auto)
 * @param {Boolean} options.useDefaultRowView использовать RowView по умолчанию.
 * В случае, если true — обязательно должны быть указаны cellView для каждой колонки
 * */

export default Marionette.View.extend({
    initialize(options) {
        _.defaults(options, defaultOptions(options));
        if (this.collection === undefined) {
            throw new Error('You must provide a collection to display.');
        }

        if (options.columns === undefined) {
            throw new Error('You must provide columns definition ("columns" option)');
        }

        if (typeof options.transliteratedFields === 'object') {
            options.columns = transliterator.setOptionsToFieldsOfNewSchema(options.columns, options.transliteratedFields);
        }

        options.onColumnSort && (this.onColumnSort = options.onColumnSort); //jshint ignore:line

        this.uniqueId = _.uniqueId('native-grid');
        this.styleSheet = document.createElement('style');

        const HeaderView = this.options.headerView || GridHeaderView;

        this.columnClasses = [];
        options.columns.forEach((c, i) => {
            const cClass = `${this.uniqueId}-column${i}`;

            this.columnClasses.push(cClass);
            c.columnClass = cClass;
        });

        if (this.options.showHeader !== false) {
            this.options.showHeader = true;
        }

        if (this.options.showHeader) {
            this.headerView = new HeaderView(
                _.defaultsPure(
                    {
                        columns: options.columns,
                        gridEventAggregator: this,
                        checkBoxPadding: options.checkBoxPadding || 0,
                        uniqueId: this.uniqueId,
                        isTree: this.options.isTree,
                        expandOnShow: options.expandOnShow
                    },
                    this.options
                )
            );

            this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
            this.listenTo(this.headerView, 'update:width', this.__setColumnWidth);
        }

        const childView = options.childView || RowView;

        const showRowIndex = this.getOption('showRowIndex');

        const childViewOptions = Object.assign(options.childViewOptions || {}, {
            columns: options.columns,
            transliteratedFields: options.transliteratedFields,
            gridEventAggregator: this,
            columnClasses: this.columnClasses,
            isTree: this.options.isTree
        });

        this.isEditable = typeof options.editable === 'boolean' ? options.editable : options.columns.some(column => column.editable);
        if (this.isEditable) {
            this.editableCellsIndexes = [];
            this.options.columns.forEach((column, index) => {
                if (column.editable) {
                    this.editableCellsIndexes.push(index);
                }
            });
            this.listenTo(this.collection, 'move:left', () => this.__onCursorMove(-1));
            this.listenTo(this.collection, 'move:right select:hidden', () => this.__onCursorMove(+1));
            this.listenTo(this.collection, 'select:some select:one', () => this.__onCursorMove(0));
            this.listenTo(this.collection, 'keydown', () => this.__onKeydown());
        }

        this.listView = new ListView({
            collection: this.collection,
            gridEventAggregator: this,
            childView,
            childViewSelector: options.childViewSelector,
            emptyView: options.emptyView,
            emptyViewOptions: options.emptyViewOptions,
            childHeight: options.childHeight,
            childViewOptions,
            loadingChildView: options.loadingChildView || LoadingChildView,
            maxRows: options.maxRows,
            height: options.height,
            isTree: this.options.isTree,
            isEditable: this.isEditable,
            showRowIndex,
            minimumVisibleRows: options.minimumVisibleRows
        });

        if (this.options.showCheckbox) {
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

            if (this.options.showConfigurationPanel) {
                this.__initializeConfigurationPanel();
            }
        }

        this.listenTo(this.listView, 'all', (eventName, eventArguments) => {
            if (eventName.startsWith('childview')) {
                this.trigger.apply(this, [eventName].concat(eventArguments));
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
        const maxIndex = this.editableCellsIndexes.length - 1;
        const currentSelectedIndex = this.editableCellsIndexes.indexOf(this.pointedCell);
        const newPosition = Math.min(maxIndex, Math.max(0, currentSelectedIndex + delta));

        const currentSelectedValue = this.editableCellsIndexes[currentSelectedIndex];
        const newSelectedValue = this.editableCellsIndexes[newPosition];
        const currentModel = this.collection.find(model => model.cid === this.collection.cursorCid);

        if (currentModel) {
            if (newSelectedValue === currentSelectedValue && delta !== 0) {
                const isPositiveDelta = delta >= 1;
                this.pointedCell = isPositiveDelta ? 0 : this.editableCellsIndexes[this.editableCellsIndexes.length - 1];
                this.collection.trigger(isPositiveDelta ? 'nextModel' : 'prevModel');
                return;
            }

            this.pointedCell = newSelectedValue;

            currentModel.trigger('select:pointed', this.pointedCell);
        }
    },

    __onKeydown() {
        const selectedModel = this.collection.find(model => model.cid === this.collection.cursorCid);
        if (selectedModel) {
            selectedModel.trigger('selected:enter');
        }
    },

    onColumnSort(column, comparator) {
        this.collection.comparator = comparator;
        this.collection.sort();
    },

    regions: {
        headerRegion: {
            el: '.js-grid-header-view',
            replaceElement: true
        },
        contentRegion: {
            el: '.js-grid-content-view',
            replaceElement: true
        },
        selectionPanelRegion: {
            el: '.js-grid-selection-panel-view',
            replaceElement: true
        },
        selectionHeaderRegion: {
            el: '.js-grid-selection-header-view',
            replaceElement: true
        },
        toolbarRegion: {
            el: '.js-grid-tools-toolbar-region',
            replaceElement: true
        },
        searchRegion: '.js-grid-tools-search-region',
        loadingRegion: '.js-grid-loading-region'
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

    className() {
        return `${this.options.class || ''} grid-container`;
    },

    template: Handlebars.compile(template),

    behaviors: {
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion'
        }
    },

    onRender() {
        this.showChildView('contentRegion', this.listView);

        if (this.options.showHeader) {
            this.showChildView('headerRegion', this.headerView);
        } else {
            this.el.classList.add('grid__headless');
        }

        if (this.options.showCheckbox) {
            if (this.options.showHeader) {
                this.showChildView('selectionHeaderRegion', this.selectionHeaderView);
            }
            this.showChildView('selectionPanelRegion', this.selectionPanelView);
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
            this.ui.title.parent().show();
            this.ui.title.text(this.getOption('title') || '');
        } else {
            this.ui.title.parent().hide();
        }
        this.updatePosition = this.listView.updatePosition.bind(this.listView.collectionView);
    },

    onAttach() {
        this.options.columns.forEach((column, i) => {
            this.__setColumnWidth(i, column.width);
        });
        document.body && document.body.appendChild(this.styleSheet);
        this.__bindListRegionScroll();
        if (this.options.showSearch && this.options.focusSearchOnAttach) {
            this.searchView.focus();
        }
        this.ui.content.css('maxHeight', this.options.maxHeight || window.innerHeight);
    },

    getChildren() {
        return this.listView.children;
    },

    __executeAction(...args) {
        this.trigger('execute:action', ...args);
    },

    __onSearch(text) {
        this.trigger('search', text);
        if (this.options.isTree) {
            this.trigger('toggle:collapse:all', !text && !this.options.expandOnShow);
        }
    },

    __bindListRegionScroll() {
        const headerRegionEl = this.options.showHeader && this.headerView.el;

        if (headerRegionEl) {
            this.listView.el.addEventListener('scroll', event => {
                headerRegionEl.scrollLeft = event.currentTarget.scrollLeft;
            });
        }
    },

    onDestroy() {
        this.styleSheet && document.body && document.body.contains(this.styleSheet) && document.body.removeChild(this.styleSheet);
        this.__configurationPanel && this.__configurationPanel.destroy();
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
        if (this.options.showHeader) {
            this.headerView.updateSorting();
        }
    },

    handleResize() {
        if (this.options.showHeader) {
            this.headerView.handleResize();
        }
    },

    setLoading(state) {
        if (!this.isDestroyed()) {
            this.loading.setLoading(state);
        }
    },

    validate() {
        if (!this.isEditable) {
            return;
        }

        return this.options.columns.some(column => {
            if (!column.editable || !column.validators) {
                return false;
            }
            const validators = [];
            return column.validators.some(validator => {
                let result;
                if (typeof validator === 'function') {
                    validators.push(validator);
                } else {
                    const predefined = form.repository.validators[validator];
                    if (typeof predefined === 'function') {
                        validators.push(predefined());
                    }
                }

                this.collection.forEach(model => {
                    if (model._events['validate:force']) {
                        const e = {};
                        model.trigger('validate:force', e);
                        if (e.validationResult) {
                            result = e.validationResult;
                        }
                    } else if (!model.isValid()) {
                        result = model.validationResult;
                    } else {
                        validators.some(v => {
                            const error = v(model.get(column.key), model.attributes);
                            if (error) {
                                result = model.validationResult = error;
                            }
                            return result;
                        });
                    }
                });
                return result;
            });
        });
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
    },

    __setColumnWidth(index, width = 0, allColumnsWidth) {
        const style = this.styleSheet;
        const columnClass = this.columnClasses[index];
        const regexp = new RegExp(`.${columnClass} { flex: [0,1] 0 [+, -]?\\S+\\.?\\S*; } `);
        let basis;
        let widthCell = '';
        if (width > 0) {
            if (width < 1) {
                basis = `${width * 100}%`;
                widthCell = `max-width: ${width * 100}%`;
            } else {
                basis = `${width}px`;
                widthCell = `max-width: ${width}px`;
            }
        } else {
            const column = this.options.columns[index];

            if (column.format === 'HTML') {
                basis = '0%';
            } else {
                const defaultWidth = columnWidthByType[column.dataType];

                if (defaultWidth) {
                    widthCell = `max-width: ${defaultWidth}px`;
                    basis = `${defaultWidth}px`;
                } else {
                    basis = '0%';
                }
            }
        }

        const grow = width > 0 ? 0 : 1;
        const newValue = `.${columnClass} { flex: ${grow} 0 ${basis}; } `;

        if (MobileService.isIE) {
            if (widthCell) {
                const regexpCells = new RegExp(`.cell.${columnClass} { max-width: [0-9]*\\.?[0-9]*[%,px;]* } `);
                const newCellValue = `.cell.${columnClass} { ${widthCell}; } `;
                if (regexpCells.test(style.innerHTML)) {
                    style.innerHTML = style.innerHTML.replace(regexpCells, newCellValue);
                } else {
                    style.innerHTML += newCellValue;
                }
            }
        }

        if (regexp.test(style.innerHTML)) {
            style.innerHTML = style.innerHTML.replace(regexp, newValue);
        } else {
            style.innerHTML += newValue;
        }

        this.__updateEmptyView(allColumnsWidth);
    },

    __updateEmptyView(allColumnsWidth) {
        if (!this.options.emptyView) {
            return;
        }
        if (this.listView.isEmpty()) {
            this.emptyViewClass = this.emptyViewClass || (() => `.${new this.options.emptyView().className}`)();
            const empty$el = this.listView.$el.find(this.emptyViewClass);
            empty$el && empty$el.width(allColumnsWidth);
            this.ui.content.css({
                'min-height': `${this.listView.childHeight}px`,
                height: '100%'
            });
        } else {
            this.ui.content.css({
                'min-height': '',
                height: ''
            });
        }
    },

    __initializeConfigurationPanel() {
        this.__configurationPanel = new ConfigurationPanel();
    }
});
