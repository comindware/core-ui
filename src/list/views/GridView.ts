/* eslint-disable no-param-reassign */
import form from 'form';
import dropdown from 'dropdown';
import { transliterator } from 'utils';
import template from '../templates/grid.hbs';
import ListView from './CollectionView';
import RowView from './RowView';
import GridHeaderView from './header/GridHeaderView';
import LoadingChildView from './LoadingRowView';
import ToolbarView from '../../components/toolbar/ToolbarView';
import MobileService from '../../services/MobileService';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import SearchBarView from '../../views/SearchBarView';
import ConfigurationPanel from './ConfigurationPanel';
import EmptyGridView from './EmptyGridView';
import LayoutBehavior from '../../layout/behaviors/LayoutBehavior';
import meta from '../meta';
import VirtualCollection from '../../collections/VirtualCollection';
import factory from '../factory';
import ErrorButtonView from '../../views/ErrorButtonView';
import InfoButtonView from '../../views/InfoButtonView';
import TooltipPanelView from '../../views/TooltipPanelView';
import ErrosPanelView from '../../views/ErrosPanelView';
import GlobalEventService from '../../services/GlobalEventService';

const classes = {
    REQUIRED: 'required',
    ERROR: 'error'
};

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
    columns: [],
    emptyView: EmptyGridView,
    emptyViewOptions: {
        text: () => (options.columns?.length ? Localizer.get('CORE.GRID.EMPTYVIEW.EMPTY') : Localizer.get('CORE.GRID.NOCOLUMNSVIEW.ALLCOLUMNSHIDDEN')),
        colspan: options.columns ? options.columns.length + !!options.showCheckbox : 0
    },
    isSliding: true,
    showHeader: true,
    handleSearch: true,
    updateToolbarEvents: '',
    childHeight: 35,
    showTreeEditor: false
});

const config = {
    VISIBLE_COLLECTION_RESERVE: 20,
    VISIBLE_COLLECTION_RESERVE_HALF: 10,
    VISIBLE_COLLECTION_AUTOSIZE_RESERVE: 100
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
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк) или не инициализированы колонки.
 * @param {Number} options.childHeight высота строки списка (childView)
 * @param {Backbone.View} [options.childView] view строки списка
 * @param {Backbone.View} [options.childViewOptions] опции для childView
 * @param {Function} options.childViewSelector ?
 * @param {Object} [options.emptyViewOptions] опции для emptyView
 * @param {String} options.height задает как определяется высота строки, значения: fixed, auto
 * @param {Backbone.View} [options.loadingChildView] view-лоадер, показывается при подгрузке строк
 * @param {Number} options.maxRows максимальное количество отображаемых строк (используется с опцией height: auto)
 * @param {Boolean} options.useDefaultRowView использовать RowView по умолчанию.
 * @param {Array} options.excludeActions Array of strings. Example: <code>[ 'archive', 'delete' ]</code>.
 * @param {Array} options.additionalActions Array of objects <code>[ id,  name,* type=button'|'checkbox', isChecked, iconClass, severity]</code>.
 * @param {Boolean} options.showCheckbox show or hide checkbox
 * В случае, если true — обязательно должны быть указаны cellView для каждой колонки
 * */

export default Marionette.View.extend({
    initialize(options) {
        _.defaults(this.options, defaultOptions(options));
        const comparator = factory.getDefaultComparator(this.options.columns);

        this.collection = factory.createWrappedCollection(Object.assign({}, this.options, { comparator }));
        if (this.collection === undefined) {
            throw new Error('You must provide a collection to display.');
        }

        if (typeof this.options.transliteratedFields === 'object') {
            transliterator.setOptionsToFieldsOfNewSchema(this.options.columns, this.options.transliteratedFields);
        }

        this.options.onColumnSort && (this.onColumnSort = this.options.onColumnSort); //jshint ignore:line

        const allToolbarActions = new VirtualCollection(new Backbone.Collection(this.__getToolbarActions()));
        const debounceUpdateAction = _.debounce(() => this.__updateActions(allToolbarActions, this.collection), 10);

        this.uniqueId = _.uniqueId('native-grid');
        this.childHeight = options.childHeight || 35; //todo fix it

        const HeaderView = this.options.headerView || GridHeaderView;

        if (this.options.showHeader !== false) {
            this.options.showHeader = true;
        }

        if (this.options.showHeader) {
            this.headerView = new HeaderView(
                _.defaultsPure(
                    {
                        columns: this.options.columns,
                        gridEventAggregator: this,
                        checkBoxPadding: options.checkBoxPadding || 0,
                        uniqueId: this.uniqueId,
                        isTree: this.options.isTree,
                        expandOnShow: options.expandOnShow,
                        showCheckbox: this.options.showCheckbox
                    },
                    this.options
                )
            );

            this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
            this.listenTo(this.headerView, 'update:width', (config: { index: Number, newColumnWidth: Number }) => this.__handleColumnWidthChange(config));
        }

        this.isEditable = typeof this.options.editable === 'boolean' ? this.options.editable : this.options.columns.some(column => column.editable);
        if (this.isEditable) {
            this.editableCellsIndexes = [];
            this.options.columns.forEach((column, index) => {
                if (column.editable) {
                    this.editableCellsIndexes.push(index);
                }
            });
            this.listenTo(this.collection, 'move:left', () => this.__onCursorMove(-1));
            this.listenTo(this.collection, 'move:right select:hidden', () => this.__onCursorMove(+1));
            this.listenTo(this.collection, 'select:some select:one', (collection, opts) => this.__onCursorMove(0, opts));
            this.listenTo(this.collection, 'keydown:default', this.__onKeydown);
            this.listenTo(this.collection, 'keydown:escape', e => this.__triggerSelectedModel('selected:exit', e));
        }

        this.__updateActions(allToolbarActions, this.collection);
        if (this.options.showToolbar || this.options.draggable) {
            if (this.options.showCheckbox) {
                this.listenTo(this.collection, 'check:all check:some check:none', debounceUpdateAction);
            } else {
                this.listenTo(this.collection, 'select:all select:some select:none deselect:one select:one', debounceUpdateAction);
            }
            if (this.options.updateToolbarEvents) {
                this.listenTo(this.collection.parentCollection, this.options.updateToolbarEvents, debounceUpdateAction);
            }
        }
        /*
	 const draggable = this.getOption('draggable');
        if (this.options.showCheckbox || draggable) {
           
            let checkboxColumnClass = '';
            if (showRowIndex) {
                this.on('update:top update:index', this.__setCheckBoxColummWidth);
                checkboxColumnClass = `${this.uniqueId}-checkbox-column`;
                this.columnClasses.push(checkboxColumnClass);
            }
            this.selectionPanelView = new SelectionPanelView({
                collection: this.listView.collection,
                gridEventAggregator: this,
                checkboxColumnClass,
                showRowIndex: this.options.showRowIndex,
                childViewOptions: {
                    draggable,
                    showRowIndex,
                    bindSelection: this.getOption('bindSelection'),
                    checkboxColumnClass
                }
            });

            this.selectionHeaderView = new SelectionCellView({
                collection: this.collection,
                selectionType: 'all',
                gridEventAggregator: this,
                checkboxColumnClass,
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
        */
        if (this.options.showToolbar) {
            this.toolbarView = new ToolbarView({
                allItemsCollection: allToolbarActions || new Backbone.Collection()
            });
            this.listenTo(this.toolbarView, 'command:execute', (model, ...rest) => this.__executeAction(model, this.collection, ...rest));
        }
        if (this.options.showSearch) {
            this.searchView = new SearchBarView();
            this.listenTo(this.searchView, 'search', this.__onSearch);
        }
        if (this.options.showTreeEditor) {
            this.__initTreeEditor();
        }
    },

    __handleColumnWidthChange(config: { index: Number, newColumnWidth: Number }) {
        const { index, newColumnWidth } = config;
        const columnModel = this.options.columns[index].columnModel;
        if (columnModel) {
            this.trigger('treeEditor:save', { [this.options.columns[index].columnModel.id]: { width: newColumnWidth } });
        }
    },

    updatePosition(position, shouldScrollElement = false) {
        const newPosition = this.__checkFillingViewport(position);
        if (newPosition === this.listView.state.position || !this.collection.isSliding) {
            return;
        }

        this.collection.updatePosition(Math.max(0, newPosition - config.VISIBLE_COLLECTION_RESERVE_HALF));
        this.__updateTop();

        this.listView.state.position = newPosition;
        if (shouldScrollElement) {
            this.internalScroll = true;

            this.ui.tableWrapper[0].scrollTop = `${newPosition * this.childHeight}px`;

            _.delay(() => (this.internalScroll = false), 100);
        }

        return newPosition;
    },

    __updateTop() {
        requestAnimationFrame(() => {
            const top = Math.max(0, this.collection.indexOf(this.collection.visibleModels[0]) * this.childHeight);
            this.ui.tableWrapper[0].style.paddingTop = `${top}px`; //todo use transforme
        });
    },

    __checkFillingViewport(position) {
        const maxPosFirstRow = Math.max(0, this.collection.length - this.listView.state.viewportHeight);

        return Math.max(0, Math.min(maxPosFirstRow, position));
    },

    __onScroll() {
        const nextScroll = this.ui.tableTopMostWrapper[0].scrollTop;
        if (
            this.listView.state.viewportHeight === undefined ||
            this.__prevScroll === nextScroll ||
            this.isDestroyed() ||
            this.collection.length <= this.listView.state.viewportHeight ||
            this.internalScroll
        ) {
            return;
        }
        this.__prevScroll = nextScroll;
        const newPosition = Math.max(0, Math.ceil(nextScroll / this.listView.childHeight));
        this.updatePosition(newPosition, false);
    },

    __onCursorMove(delta, options = {}) {
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

            !options.isModelClick && currentModel.trigger('select:pointed', this.pointedCell, false);
        }
    },

    __onKeydown(e) {
        this.__triggerSelectedModel('selected:enter', e);
    },

    __triggerSelectedModel(triggerEvent, ...args) {
        const selectedModel = this.collection.find(model => model.cid === this.collection.cursorCid);
        if (selectedModel) {
            selectedModel.trigger(triggerEvent, ...args);
        }
    },

    toggleSearchActivity(enableSearch) {
        this.searchView.toggleInputActivity(enableSearch);
    },

    onColumnSort(column, comparator) {
        this.collection.comparator = comparator;
        this.collection.sort();
    },

    regions: {
        treeEditorRegion: '.js-grid-tree-editor-region',
        headerRegion: '.js-grid-header-view',
        contentRegion: {
            el: '.js-grid-content-view',
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
        loadingRegion: '.js-grid-loading-region',
        errorTextRegion: '.js-grid-error-text-region',
        helpTextRegion: '.js-grid-help-text-region'
    },

    ui: {
        title: '.js-grid-title',
        tools: '.js-grid-tools',
        header: '.js-grid-header-view',
        content: '.js-grid-content',
        tableWrapper: '.grid-table-wrapper',
        table: '.grid-content-wrp',
        tableTopMostWrapper: '.grid-table-wrapper-war'
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
        },
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onRender() {
        if (this.options.showHeader) {
            this.showChildView('headerRegion', this.headerView);
            this.options.columns.forEach(column => this.__toggleColumnVisibility(column.key, column.isHidden));
        } else {
            this.el.classList.add('grid__headless');
        }

        if (this.options.showTreeEditor) {
            this.showChildView('treeEditorRegion', this.treeEditorView);
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
        if (this.options.helpText) {
            const viewModel = new Backbone.Model({
                helpText: this.options.helpText,
                errorText: null
            });

            const infoPopout = dropdown.factory.createPopout({
                buttonView: InfoButtonView,
                panelView: TooltipPanelView,
                panelViewOptions: {
                    model: viewModel,
                    textAttribute: 'helpText'
                },
                popoutFlow: 'right',
                customAnchor: true
            });
            this.showChildView('helpTextRegion', infoPopout);
        }
        this.setRequired(this.options.required);
        this.__updateState();
        if (Core.services.MobileService.isIE) {
            this.ui.tableTopMostWrapper[0].addEventListener('scroll', () => this.__onScroll());
        } else {
            this.ui.tableTopMostWrapper[0].addEventListener('scroll', () => this.__onScroll(), { passive: true });
        }
    },

    onAttach() {
        const childView = this.options.childView || RowView;

        const showRowIndex = this.getOption('showRowIndex');

        const childViewOptions = Object.assign(this.options.childViewOptions || {}, {
            columns: this.options.columns,
            transliteratedFields: this.options.transliteratedFields,
            gridEventAggregator: this,
            isTree: this.options.isTree,
            showCheckbox: this.options.showCheckbox,
            draggable: this.options.draggable,
            showRowIndex
        });

        this.listView = new ListView({
            collection: this.collection,
            gridEventAggregator: this,
            childView,
            childViewSelector: this.options.childViewSelector,
            emptyView: this.options.emptyView,
            emptyViewOptions: this.options.emptyViewOptions,
            childHeight: this.options.childHeight,
            childViewOptions,
            loadingChildView: this.options.loadingChildView || LoadingChildView,
            maxRows: this.options.maxRows,
            height: this.options.height,
            isTree: this.options.isTree,
            isEditable: this.isEditable,
            showRowIndex,
            parentEl: this.ui.tableWrapper[0],
            parent$el: this.ui.tableWrapper,
            table$el: this.ui.table,
            minimumVisibleRows: this.options.minimumVisibleRows,
            selectOnCursor: this.options.selectOnCursor
        });
        this.listenTo(this.listView, 'update:position:internal', state => this.updatePosition(state.topIndex, state.shouldScrollElement));

        this.showChildView('contentRegion', this.listView);

        if (this.options.showSearch && this.options.focusSearchOnAttach) {
            this.searchView.focus();
        }
        const toolbarShowed = this.options.showToolbar || this.options.showSearch;

        this.listenTo(this.listView, 'drag:drop', this.__onItemMoved);
        this.listenTo(GlobalEventService, 'window:resize', () => this.updateListViewResize({ newMaxHeight: window.innerHeight, shouldUpdateScroll: false }));
    },

    getChildren() {
        return this.listView.children;
    },

    update() {
        this.__updateState();
    },

    updateListViewResize(options) {
        if (options.newMaxHeight) {
            this.ui.content.css('maxHeight', options.newMaxHeight);
        }
        this.listView.handleResize(options.shouldUpdateScroll);
    },

    onBeforeDestroy() {
        this.__configurationPanel && this.__configurationPanel.destroy();
        if (Core.services.MobileService.isIE) {
            this.ui.tableTopMostWrapper[0].removeEventListener('scroll', () => this.__onScroll());
        } else {
            this.ui.tableTopMostWrapper[0].removeEventListener('scroll', () => this.__onScroll(), { passive: true });
        }
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
        let error;
        if (this.required && this.collection.length === 0) {
            error = {
                type: 'required',
                message: Localizer.get('CORE.FORM.VALIDATION.REQUIREDGRID')
            };
        } else if (this.isEditable) {
            const hasErrorInFields = this.options.columns.some(column => {
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
                                const filedError = v(model.get(column.key), model.attributes);
                                if (filedError) {
                                    result = model.validationResult = filedError;
                                }
                                return result;
                            });
                        }
                    });
                    return result;
                });
            });
            if (hasErrorInFields) {
                error = {
                    type: 'gridError',
                    message: Localizer.get('CORE.FORM.VALIDATION.GRIDERROR'),
                    severity: 'Error'
                };
            }
        }

        if (error) {
            this.setError([error]);
        } else {
            this.clearError();
        }

        return error;
    },

    __handleDragLeave(event) {
        const element = document.elementFromPoint(event.pageX, event.pageY);
        if (!this.el.contains(element)) {
            if (this.collection.dragoverModel) {
                this.collection.dragoverModel.trigger('dragleave');
            } else {
                this.collection.trigger('dragleave:head');
            }
            this.collection.dragoverModel = null;
        }
    },

    // __setCheckBoxColummWidth() {
    //     const lastVisibleModelIndex = this.collection.indexOf(this.collection.visibleModels[this.collection.visibleModels.length - 1]) + 1;
    //     const isMainTheme = Core.services.ThemeService.getTheme() === 'main';
    //     const baseWidth = isMainTheme ? 37 : 42;
    //     const numberWidth = isMainTheme ? 7.3 : 7.44;
    //     this.__setColumnWidth(this.options.columns.length, baseWidth + lastVisibleModelIndex.toString().length * numberWidth, undefined, true);
    // },

    // __setColumnWidth(index: number, width = 0, allColumnsWidth, isCheckBoxCell: boolean) {
    //     const style = this.styleSheet;
    //     const columnClass = ''; //this.columnClasses[index];

    //     const regexp = isCheckBoxCell ? new RegExp(`.${columnClass} { width: \\d+\\.?\\d*px; } `) : new RegExp(`.${columnClass} { flex: [0,1] 0 [+, -]?\\S+\\.?\\S*; } `);
    //     let basis;

    //     if (width > 0) {
    //         if (width < 1) {
    //             basis = `${width * 100}%`;
    //         } else {
    //             basis = `${width}px`;
    //         }
    //     } else {
    //         const column = this.options.columns[index];

    //         if (column.format === 'HTML') {
    //             basis = '0%';
    //         } else {
    //             const defaultWidth = columnWidthByType[column.dataType]; //what is it?

    //             if (defaultWidth) {
    //                 basis = `${defaultWidth}px`;
    //             } else {
    //                 basis = '0%';
    //             }
    //         }
    //     }

    //     const grow = width > 0 ? 0 : 1;
    //     const newValue = isCheckBoxCell ? `.${columnClass} { width: ${width}px; } ` : `.${columnClass} { flex: ${grow} 0 ${basis}; } `;

    //     if (regexp.test(style.innerHTML)) {
    //         style.innerHTML = style.innerHTML.replace(regexp, newValue);
    //     } else {
    //         style.innerHTML += newValue;
    //     }

    //     this.__updateEmptyView(allColumnsWidth);
    // },

    __executeAction(model, collection, ...rest) {
        const selected = this.__getSelectedItems(collection);
        switch (model.get('id')) {
            case 'delete':
                this.__confirmUserAction(
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.TEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.TITLE'),
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model, selected, ...rest);
                    }
                });
                break;
            case 'archive':
                this.__confirmUserAction(
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.TEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.TITLE'),
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model, selected, ...rest);
                    }
                });
                break;
            case 'unarchive':
                this.__confirmUserAction(
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.TEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.TITLE'),
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model, selected, ...rest);
                    }
                });
                break;
            case 'add':
            default:
                this.__triggerAction(model, selected, ...rest);
                break;
        }
    },

    __confirmUserAction(text: string = '', title: string = '', yesButtonText: string = 'Yes', noButtonText: string = 'No') {
        return Core.services.MessageService.showMessageDialog(text, title, [{ id: false, text: noButtonText }, { id: true, text: yesButtonText }]);
    },

    __triggerAction(model, selected, ...rest) {
        this.trigger('execute', model, selected, ...rest);
    },

    __onItemMoved(...args) {
        this.trigger('move', ...args);
    },

    setError(errors: Array<any>): void {
        if (!this.__checkUiReady()) {
            return;
        }

        this.el.classList.add(classes.ERROR);
        this.errorCollection ? this.errorCollection.reset(errors) : (this.errorCollection = new Backbone.Collection(errors));
        if (!this.isErrorShown) {
            const errorPopout = dropdown.factory.createPopout({
                buttonView: ErrorButtonView,
                panelView: ErrosPanelView,
                panelViewOptions: {
                    collection: this.errorCollection
                },
                popoutFlow: 'right',
                customAnchor: true
            });
            this.showChildView('errorTextRegion', errorPopout);
            this.isErrorShown = true;
        }
    },

    clearError(): void {
        if (!this.__checkUiReady()) {
            return;
        }
        this.el.classList.remove(classes.ERROR);
        this.errorCollection && this.errorCollection.reset();
    },

    setRequired(required: boolean) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.required = required;
        this.__updateEmpty();
        if (required) {
            this.listenTo(this.collection, 'add remove reset update', this.__updateEmpty);
        } else {
            this.stopListening(this.collection, 'add remove reset update', this.__updateEmpty);
        }
    },

    __updateEmpty() {
        if (this.required) {
            this.__toggleRequiredClass(this.collection.length === 0);
        } else {
            this.__toggleRequiredClass(false);
        }
    },

    __toggleRequiredClass(required) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.toggleClass(classes.REQUIRED, Boolean(required));
    },

    __checkUiReady() {
        return this.isRendered() && !this.isDestroyed();
    },

    __initializeConfigurationPanel() {
        this.__configurationPanel = new ConfigurationPanel();
    },

    __onSearch(text) {
        if (this.options.isTree) {
            this.trigger('toggle:collapse:all', !text && !this.options.expandOnShow);
        }
        if (!this.getOption('handleSearch')) {
            this.trigger('search', text);
            return;
        }
        if (text) {
            this.__applyFilter(new RegExp(text, 'i'), this.options.columns, this.collection);
            this.__highlightCollection(text, this.collection);
        } else {
            this.__clearFilter(this.collection);
            this.__unhighlightCollection(this.collection);
        }
    },

    __applyFilter(regexp, columns, collection) {
        collection.filter(model => {
            let result = false;
            const searchableColumns = columns.filter(column => column.searchable !== false).map(column => column.id || column.key);
            searchableColumns.forEach(column => {
                const values = model.get(column);
                const testValueFunction = value => {
                    if (value) {
                        const testValue = value.name || value.text || value.toString();
                        return regexp.test(testValue);
                    }
                };
                if (Array.isArray(values) && values.length) {
                    values.forEach(value => {
                        result = result || testValueFunction(value);
                    });
                } else {
                    result = result || testValueFunction(values);
                }
            });

            return result;
        });
    },

    __clearFilter(collection) {
        collection.filter();
    },

    __highlightCollection(text, collection) {
        collection.each(model => {
            model.highlight(text);
        });
    },

    __unhighlightCollection(collection) {
        collection.each(model => {
            model.unhighlight();
        });
    },

    __getToolbarActions() {
        let toolbarActions = [];
        const defaultActions = meta.getDefaultActions();
        if (!this.options.excludeActions) {
            toolbarActions = defaultActions;
        } else if (this.options.excludeActions !== 'all') {
            toolbarActions = defaultActions.filter(action => this.options.excludeActions.indexOf(action.id) === -1);
        }
        if (this.options.additionalActions) {
            toolbarActions = toolbarActions.concat(this.options.additionalActions);
        }
        return toolbarActions;
    },

    __updateActions(allToolbarActions, collection) {
        const selected = this.__getSelectedItems(collection);
        const selectedLength = selected.length;

        allToolbarActions.filter(action => {
            let isActionApplicable;
            switch (action.get('contextType')) {
                case 'one':
                    isActionApplicable = selectedLength === 1;
                    break;
                case 'any':
                    isActionApplicable = selectedLength;
                    break;
                case 'void':
                default:
                    isActionApplicable = true;
            }
            const condition = action.get('condition');
            if (isActionApplicable && condition && typeof condition === 'function') {
                isActionApplicable = condition(selected);
            }
            return isActionApplicable;
        });
    },

    __getSelectedItems(collection) {
        const selected = (this.options.showCheckbox ? collection.checked : collection.selected) || {};
        if (selected instanceof Backbone.Model) {
            return [selected];
        }
        return Object.values(selected);
    },

    __initTreeEditor() {
        const columnsCollection = new Backbone.Collection(this.options.columns);
        columnsCollection.map(model => {
            model.id = model.get('key');
            this.listenTo(model, 'change:isHidden', model => this.__toggleColumnVisibility(model.id, model.get('isHidden')));

            return model;
        });
        this.treeModel = new Backbone.Model({
            title: this.options.title,
            columnsCollection
        });

        this.treeModel.id = _.uniqueId('treeModelRoot');
        this.treeModel.isContainer = !!this.options.columns.length;
        this.treeModel.childrenAttribute = 'columnsCollection';
        this.treeEditorView = new Core.components.TreeEditor({
            model: this.treeModel,
            getNodeName(model) {
                return model.get('title');
            }
        });

        this.listenTo(columnsCollection, 'add', model => {
            const config = {
                oldIndex: this.options.columns.findIndex(col => col.key === model.id),
                newIndex: columnsCollection.indexOf(model)
            };
            this.__moveColumn(config);
        });

        this.listenTo(this.treeEditorView, 'save', config => this.trigger('treeEditor:save', config));
    },

    __moveColumn(options: { oldIndex: number, newIndex: number }) {
        const { oldIndex, newIndex } = options;
        const one = Number(!!this.el.querySelector('.cell_selection-index'));
        const headerElementsCollection = this.el.querySelectorAll('.grid-header-column');

        if (newIndex === oldIndex) {
            return;
        }
        if (newIndex < 0 || newIndex >= headerElementsCollection.length) {
            return;
        }

        const moveElement = el => {
            const parentElement = el.parentElement;
            parentElement.removeChild(el);
            parentElement.insertBefore(el, parentElement.children[newIndex + one]);
        };
        const element = headerElementsCollection[oldIndex];

        moveElement(element);

        const cells = Array.from(this.el.querySelectorAll(`tbody tr > td:nth-child(${oldIndex + 1 + one})`));
        cells.forEach(row => moveElement(row));

        this.__moveArrayElement(this.options.columns, oldIndex, newIndex);

        this.trigger('column:move', config);
    },

    __moveArrayElement(array: any[], oldIndex: number, newIndex: number) {
        const start = newIndex < 0 ? array.length + newIndex : newIndex;
        const deleteCount = 0;
        const item = array.splice(oldIndex, 1)[0];
        array.splice(start, deleteCount, item);
    },

    __toggleColumnVisibility(key: string, isHidden = false) {
        const columns = this.options.columns;
        const index = columns.findIndex(item => item.key === key);
        const columnToBeHidden = columns[index];

        if (isHidden) {
            columnToBeHidden.isHidden = isHidden;
        } else {
            delete columnToBeHidden.isHidden;
        }

        let elementIndex = index + 1;
        if (this.el.querySelector('.cell_selection-index')) {
            elementIndex += 1;
        }

        const headerSelector = `.js-grid-header-view tr > *:nth-child(${elementIndex})`;
        this.el.querySelector(headerSelector).classList.toggle(meta.hiddenByTreeEditorClass, isHidden);

        const cellSelector = `.visible-collection tr > *:nth-child(${elementIndex})`;
        Array.from(this.el.querySelectorAll(cellSelector)).forEach(element => {
            element.classList.toggle(meta.hiddenByTreeEditorClass, isHidden);
        });

        if (this._isAttached) {
            this.__toggleNoColumnsMessage(columns);
        } else {
            const interval = setInterval(() => {
                if (this._isAttached) {
                    clearInterval(interval);
                    this.__toggleNoColumnsMessage(columns);
                }
            }, 0);
        }
    },

    __toggleNoColumnsMessage(columns: Array<object>) {
        let hiddenColumnsCounter = 0;
        columns.forEach(col => {
            if (col.isHidden) {
                hiddenColumnsCounter++;
            }
        });
        if (hiddenColumnsCounter === columns.length) {
            const noColumnsMessage = document.createElement('div');
            noColumnsMessage.innerText = 'All columns are hidden'; //TODO localize
            noColumnsMessage.classList.add('tree-editor-no-columns-message', 'empty-view', 'empty-view_text');

            this.el.querySelector('.js-grid-content').appendChild(noColumnsMessage);
            this.el.querySelector('tbody').classList.add('hidden-by-tree-editor');
        } else if (hiddenColumnsCounter === columns.length - 1 && this.el.querySelector('.tree-editor-no-columns-message')) {
            this.el.querySelector('.tree-editor-no-columns-message').remove();
            this.el.querySelector('tbody').classList.remove('hidden-by-tree-editor');
        }
    }
});
