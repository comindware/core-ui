//@flow
/* eslint-disable no-param-reassign */

import form from 'form';
import dropdown from 'dropdown';
import { columnWidthByType } from '../meta';
import { stickybits, transliterator } from 'utils';
import template from '../templates/grid.hbs';
import ListView from './CollectionView';
import RowView from './RowView';
import SelectionPanelView from './selections/SelectionPanelView';
import SelectionCellView from './selections/SelectionCellView';
import GridHeaderView from './header/GridHeaderView.js';
import LoadingChildView from './LoadingRowView';
import ToolbarView from '../../components/toolbar/ToolbarView';
import MobileService from '../../services/MobileService';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import SearchBarView from '../../views/SearchBarView';
import ConfigurationPanel from './ConfigurationPanel';
import EmptyGridView from '../views/EmptyGridView';
import LayoutBehavior from '../../layout/behaviors/LayoutBehavior';
import ErrorButtonView from '../../views/ErrorButtonView';
import InfoButtonView from '../../views/InfoButtonView';
import TooltipPanelView from '../../views/TooltipPanelView';
import ErrorsPanelView from '../../views/ErrorsPanelView';
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
    emptyView: EmptyGridView,
    emptyViewOptions: {
        text: () => (options.columns.length ? Localizer.get('CORE.GRID.EMPTYVIEW.EMPTY') : Localizer.get('CORE.GRID.NOCOLUMNSVIEW.ALLCOLUMNSHIDDEN'))
    },
    stickyToolbarOffset: 0
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
            transliterator.setOptionsToFieldsOfNewSchema(options.columns, options.transliteratedFields);
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
            this.listenTo(this.headerView, 'set:emptyView:width', this.__updateEmptyView);
        }

        const childView = options.childView || RowView;

        const showRowIndex = this.getOption('showRowIndex');
        const showCheckbox = this.getOption('showCheckbox');

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
            this.listenTo(this.collection, 'keydown:default', this.__onKeydown);
            this.listenTo(this.collection, 'keydown:escape', e => this.__triggerSelectedModel('selected:exit', e));
            this.listenTo(this.collection, 'change', this.__validateModel);
        }
        this.__debounceCheckBlur = _.debounce(this.__checkBlur, 300).bind(this);
        this.listenTo(this.collection, 'select:some select:one', this.__onCollectionSelect);

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
            showCheckbox,
            minimumVisibleRows: options.minimumVisibleRows
        });

        const draggable = this.getOption('draggable');

        if (showCheckbox || draggable) {
            let checkboxColumnClass = '';
            if (showRowIndex) {
                this.on('update:top update:index', this.__setCheckBoxColummWidth);
                checkboxColumnClass = `${this.uniqueId}-checkbox-column`;
                this.columnClasses.push(checkboxColumnClass);
            }

            this.selectionPanelChildOptions = {
                draggable,
                showCheckbox,
                showRowIndex,
                bindSelection: this.getOption('bindSelection'),
                checkboxColumnClass
            };

            this.selectionPanelView = new SelectionPanelView({
                collection: this.listView.collection,
                gridEventAggregator: this,
                checkboxColumnClass,
                showRowIndex: this.options.showRowIndex,
                childViewOptions: this.selectionPanelChildOptions
            });

            this.selectionHeaderView = new SelectionCellView({
                collection: this.collection,
                selectionType: 'all',
                showCheckbox,
                gridEventAggregator: this,
                checkboxColumnClass,
                showRowIndex
            });

            this.listenTo(this.selectionPanelView, 'childview:drag:drop', (...args) => this.trigger('drag:drop', ...args));
            this.listenTo(this.selectionHeaderView, 'drag:drop', (...args) => this.trigger('drag:drop', ...args));

            if (this.options.showConfigurationPanel) {
                this.__initializeConfigurationPanel();
            }
        }

        this.listenTo(this.listView, 'all', (eventName, eventArguments) => {
            if (eventName.startsWith('childview')) {
                this.trigger.apply(this, [eventName].concat(eventArguments));
            }
            if (eventName === 'empty:view:destroyed') {
                this.__resetViewStyle();
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

    replaceColumns(newColumns = []) {
        const columns = this.options.columns;

        newColumns.forEach(newColumn => {
            const index = columns.findIndex(column => column.key === newColumn.key);
            const [oldColumn] = columns.splice(index, 1, newColumn);

            newColumn.columnClass = oldColumn.columnClass;
        });

        this.listView.render();
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
        headerRegion: {
            el: '.js-grid-header-view',
            replaceElement: true
        },
        contentRegion: '.js-grid-content-view',
        selectionPanelRegion: '.js-grid-selection-panel-view',
        selectionHeaderRegion: {
            el: '.js-grid-selection-header-view',
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
        },
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onRender() {
        this.showChildView('contentRegion', this.listView);

        if (this.options.showHeader) {
            this.showChildView('headerRegion', this.headerView);
        } else {
            this.el.classList.add('grid__headless');
        }

        if (this.options.showCheckbox || this.getOption('draggable')) {
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
        this.updatePosition = this.listView.updatePosition.bind(this.listView.collectionView);
        this.__updateState();
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
        const toolbarShowed = this.options.showToolbar || this.options.showSearch;

        this.stickyHeaderInstance = stickybits(this.el.querySelector('.grid-header-wrp'), {
            stickyBitStickyOffset: toolbarShowed ? 50 : this.options.stickyToolbarOffset,
            scrollEl: this.options.scrollEl,
            customStickyChangeNumber: this.options.customStickyChangeNumber,
            stateChangeCb: currentState => {
                //hack for IE11
                switch (currentState) {
                    case 'sticky': {
                        // fixed header fall of layout
                        this.ui.content[0].style.marginTop = '35px'; // header height + default margin
                        break;
                    }
                    default:
                        // static header
                        this.ui.content[0].style.marginTop = ''; // default margin
                        break;
                }
            }
        });
        if (toolbarShowed) {
            this.stickyToolbarInstance = stickybits(this.el.querySelector('.js-grid-tools'), { scrollEl: this.options.scrollEl });
        }
        //hack for IE11
        if (Core.services.MobileService.isIE) {
            this.on('update:height', () => {
                this.stickyHeaderInstance.update();
                if (toolbarShowed) {
                    this.stickyToolbarInstance.update();
                }
            });
        }

        this.listenTo(GlobalEventService, 'window:resize', () => this.updateListViewResize({ newMaxHeight: window.innerHeight, shouldUpdateScroll: false }));
    },

    getChildren() {
        return this.listView.children;
    },

    update() {
        this.__updateState();
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
        const selectionPanelRegionEl = (this.options.showCheckbox || this.getOption('draggable')) && this.getRegion('selectionPanelRegion').el;

        this.getRegion('contentRegion').el.addEventListener('scroll', event => {
            if (headerRegionEl) {
                headerRegionEl.scrollLeft = event.currentTarget.scrollLeft;
            }
            if (selectionPanelRegionEl) {
                selectionPanelRegionEl.scrollTop = event.currentTarget.scrollTop;
            }
        });
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

    updateListViewResize(options) {
        if (options.newMaxHeight) {
            this.ui.content.css('maxHeight', options.newMaxHeight);
        }
        this.listView.handleResize(options.shouldUpdateScroll);
        if (this.stickyHeaderInstance) {
            this.stickyHeaderInstance.update();
        }
        if (this.stickyToolbarInstance) {
            this.stickyToolbarInstance.update();
        }
    },

    setLoading(state) {
        if (!this.isDestroyed()) {
            this.loading.setLoading(state);
        }
    },

    validate() {
        const errors = [];
        if (this.required && this.collection.length === 0) {
            errors.push({
                type: 'required',
                message: Localizer.get('CORE.FORM.VALIDATION.REQUIREDGRID'),
                severity: 'Error'
            });
        }
        if (this.isEditable) {
            let isErrorInCells = false;
            this.collection.forEach(model => {
                const modelHasErrors = this.__validateModel(model);
                if (modelHasErrors) {
                    isErrorInCells = true;
                }
            });
            if (isErrorInCells) {
                errors.push({
                    type: 'gridError',
                    message: Localizer.get('CORE.FORM.VALIDATION.GRIDERROR'),
                    severity: 'Error'
                });
            }
        }

        if (errors.length) {
            this.setError(errors);
            return errors;
        }
        this.clearError();
    },

    setDraggable(draggable) {
        if (this.selectionPanelView) {
            this.selectionPanelChildOptions.draggable = draggable;
            this.selectionPanelView.render();
        }
    },

    __validateModel(model) {
        let hasErrors = false;
        delete model.validationError;
        if (!model.isValid()) {
            hasErrors = true;
        }
        this.options.columns.forEach(column => {
            if (!column.editable || !column.validators) {
                return;
            }
            column.validators.forEach(validatorOptions => {
                const validator = form.repository.getValidator(validatorOptions);
                const fieldError = validator(model.get(column.key), model.attributes);
                if (fieldError) {
                    fieldError;
                    hasErrors = true;
                    if (!model.validationError) {
                        model.validationError = {};
                    }
                    if (!model.validationError[column.key]) {
                        model.validationError[column.key] = [];
                    }
                    model.validationError[column.key].push(fieldError);
                }
            });
        });
        model.trigger('validated');

        return hasErrors;
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

    __setCheckBoxColummWidth() {
        const lastVisibleModelIndex = this.collection.indexOf(this.collection.visibleModels[this.collection.visibleModels.length - 1]) + 1;
        const isMainTheme = Core.services.ThemeService.getTheme() === 'main';
        const baseWidth = isMainTheme ? 37 : 42;
        const numberWidth = isMainTheme ? 7.3 : 7.44;
        this.__setColumnWidth(this.options.columns.length, baseWidth + lastVisibleModelIndex.toString().length * numberWidth, undefined, true);
    },

    __setColumnWidth(index, width = 0, allColumnsWidth, isCheckBoxCell) {
        const style = this.styleSheet;
        const columnClass = this.columnClasses[index];

        const regexp = isCheckBoxCell ? new RegExp(`.${columnClass} { width: \\d+\\.?\\d*px; } `) : new RegExp(`.${columnClass} { flex: [0,1] 0 [+, -]?\\S+\\.?\\S*; } `);
        let basis;

        if (width > 0) {
            if (width < 1) {
                basis = `${width * 100}%`;
            } else {
                basis = `${width}px`;
            }
        } else {
            const column = this.options.columns[index];

            if (column.format === 'HTML') {
                basis = '0%';
            } else {
                const defaultWidth = columnWidthByType[column.dataType];

                if (defaultWidth) {
                    basis = `${defaultWidth}px`;
                } else {
                    basis = '0%';
                }
            }
        }

        const grow = width > 0 ? 0 : 1;
        const newValue = isCheckBoxCell ? `.${columnClass} { width: ${width}px; } ` : `.${columnClass} { flex: ${grow} 0 ${basis}; } `;

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

            if (allColumnsWidth && empty$el) {
                empty$el && empty$el.width(allColumnsWidth);
            }

            this.ui.content.css({
                'min-height': `${this.listView.childHeight}px`,
                height: '100%'
            });
        }
    },

    __initializeConfigurationPanel() {
        this.__configurationPanel = new ConfigurationPanel();
    },

    __resetViewStyle() {
        this.ui.content.css({
            'min-height': '',
            height: ''
        });
    },

    setError(errors: Array<any>): void {
        if (!this.__checkUiReady()) {
            return;
        }

        this.$el.addClass(classes.ERROR);
        this.errorCollection ? this.errorCollection.reset(errors) : (this.errorCollection = new Backbone.Collection(errors));
        if (!this.isErrorShown) {
            const errorPopout = dropdown.factory.createPopout({
                buttonView: ErrorButtonView,
                panelView: ErrorsPanelView,
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
        this.$el.removeClass(classes.ERROR);
        this.errorCollection && this.errorCollection.reset();
    },

    setRequired(required) {
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

    getToolbarItems() {
        return this.toolbarView?.getToolbarItems();
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

    __onCollectionSelect(collection, options) {
        this.stopListening(GlobalEventService, 'window:mousedown:captured', this.__debounceCheckBlur);
        this.listenTo(GlobalEventService, 'window:mousedown:captured', this.__debounceCheckBlur);
        if (this.isEditable) {
            this.__onCursorMove(0, options);
        }
    },

    __checkBlur(target: Element) {
        if (this.isDestroyed()) {
            return;
        }
        const popupContainer = document.querySelector('.js-global-popup-stack');
        const element = document.body.contains(target) ? target : document.activeElement;
        const isElementOutOfElementOrPopup = this.el.contains(element) || popupContainer?.contains(element);
        if (!isElementOutOfElementOrPopup) {
            this.collection.selectNone ? this.collection.selectNone() : this.collection.deselect();
            this.stopListening(GlobalEventService, 'window:mousedown:captured', this.__debounceCheckBlur);
        }
    }
});
