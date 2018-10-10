//@flow
import form from 'form';
import template from '../templates/grid.hbs';
import ListView from './CollectionView';
import RowView from './RowView';


import GridHeaderView from './GridHeaderView';
import NoColumnsDefaultView from './NoColumnsView';
import LoadingChildView from './LoadingRowView';
import ToolbarView from '../../components/toolbar/ToolbarView';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import SearchBarView from '../../views/SearchBarView';
import ConfigurationPanel from './ConfigurationPanel';
import transliterator from 'utils/transliterator';

/*
    Public interface:

    This view produce:
        trigger: positionChanged (sender, { oldPosition, position })
        trigger: viewportHeightChanged (sender, { oldViewportHeight, viewportHeight })
    This view react on:
        collection change (via Backbone.Collection events)
        position change (when we scroll with scrollbar for example): updatePosition(newPosition)
 */

const defaultOptions = () => ({
    focusSearchOnAttach: !MobileService.isMobile
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
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк)
 * @param {Number} options.childHeight высота строки списка (childView)
 * @param {Number} options.maxHeight максимальная высота всего списка
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
 * */

export default Marionette.View.extend({
    initialize(options) {
        _.defaults(options, defaultOptions());
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

        if (this.options.showHeader !== false) {
            this.options.showHeader = true;
        }

        if (this.options.showHeader) {
            this.headerView = new GridHeaderView({
                columns: options.columns,
                gridEventAggregator: this,
                checkBoxPadding: options.checkBoxPadding || 0,
                gridColumnHeaderView: options.gridColumnHeaderView,
                uniqueId: this.uniqueId,
                isTree: this.options.isTree,
                expandOnShow: options.expandOnShow,
                showCheckbox: this.options.showCheckbox,
            });

            this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
        }

        if (options.noColumnsView) {
            this.noColumnsView = options.noColumnsView;
        } else {
            this.noColumnsView = NoColumnsDefaultView;
        }
        options.noColumnsViewOptions && (this.noColumnsViewOptions = options.noColumnsViewOptions); // jshint ignore:line

        const childView = options.childView || RowView;

        const showRowIndex = this.getOption('showRowIndex');

        const childViewOptions = Object.assign(options.childViewOptions || {}, {
            columns: options.columns,
            transliteratedFields: options.transliteratedFields,
            gridEventAggregator: this,
            isTree: this.options.isTree,
            showCheckbox: this.options.showCheckbox
        });

        this.isEditable = _.isBoolean(options.editable) ? options.editable : options.columns.some(column => column.editable);
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
            isTree: this.options.isTree,
            isEditable: this.isEditable,
            showRowIndex,
            minimumVisibleRows: options.minimumVisibleRows
        });


            if (this.options.showConfigurationPanel) {
                this.__initializeConfigurationPanel();
            }
        this.listenTo(this.listView, 'all', (eventName, eventArguments) => {
            if (eventName.startsWith('childview')) {
                this.trigger.apply(this, [eventName].concat(eventArguments));
            }
        });

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
        headerRegion: {
            el: '.js-grid-header-view',
            replaceElement: true
        },
        contentRegion: {
            el: '.js-grid-content-view',
            replaceElement: true
        },
        noColumnsViewRegion: {
            el: '.js-nocolumns-view-region',
            replaceElement: true
        },
        toolbarRegion: {
            el: '.js-grid-tools-toolbar-region',
            replaceElement: true
        },
        searchRegion: {
            el: '.js-grid-tools-search-region',
            replaceElement: true
        },
        loadingRegion: {
            el: '.js-grid-loading-region',
            replaceElement: true
        }
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
        if (this.options.columns.length === 0) {
            const noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
            this.noColumnsViewRegion.show(noColumnsView);
        }

        this.showChildView('contentRegion', this.listView);

        if (this.options.showHeader) {
            this.showChildView('headerRegion', this.headerView);
        } else {
            this.el.classList.add('grid__headless');
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
        if (this.options.showSearch && this.options.focusSearchOnAttach) {
            this.searchView.focus();
        }
        this.ui.content.css('maxHeight', this.options.maxHeight || window.innerHeight);
    },

    getChildren() {
        return this.listView.children;
    },

    __executeAction(model) {
        this.trigger('execute:action', model);
    },

    __onSearch(text) {
        this.trigger('search', text);
        if (this.options.isTree) {
            this.trigger('toggle:collapse:all', !text && !this.options.expandOnShow);
        }
    },
    onDestroy() {
        this.__configurationPanel && this.__configurationPanel.destroy();
    },
    sortBy(columnIndex, sortingOtter) {
        let sorting = sortingOtter;
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

    __initializeConfigurationPanel() {
        this.__configurationPanel = new ConfigurationPanel();
    }
});
