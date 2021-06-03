import { comparators, helpers } from 'utils/index';
import template from '../../templates/gridheader.hbs';
import InfoButtonView from './InfoButtonView';
import InfoMessageView from './InfoMessageView';
import Marionette from 'backbone.marionette';
import _ from 'underscore';
import Backbone from 'backbone';
import { classes } from '../../meta';
import { GraphModel } from '../../../components/treeEditor/types';

/**
 * @name GridHeaderView
 * @memberof module:core.list.views
 * @class GridHeaderView
 * @constructor
 * @description View используемый для отображения заголовка (шапки) списка
 * @extends Marionette.View
 * @param {Object} options Constructor options
 * @param {Array} options.columns массив колонок
 * @param {Object} options.gridEventAggregator ?
 * */

// for manual selectionCellWidth calculating
const baseSelectionCellWidth = 34;
const oneSymbolWidth = 8;

const GridHeaderView = Marionette.View.extend({
    initialize(options) {
        if (!options.columns) {
            throw new Error('You must provide columns definition ("columns" option)');
        }
        if (!options.gridEventAggregator) {
            throw new Error('You must provide grid event aggregator ("gridEventAggregator" option)');
        }
        const columnsCollection = options.columnsCollection;
        this.gridEventAggregator = options.gridEventAggregator;
        this.collection = options.gridEventAggregator.collection;

        this.styleSheet = options.styleSheet;
        this.columnIndexOffset = options.showCheckbox ? 1 : 0;
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleColumnSort');
        this.listenTo(this.gridEventAggregator, 'update:collapse:all', this.__updateCollapseAll);
        this.listenTo(this.collection, 'check:all check:none check:some', this.__updateState);
        this.listenTo(columnsCollection, 'change:width', (model: GraphModel, newColumnWidth: any) => {
            const index = columnsCollection.indexOf(model);
            this.__setColumnWidth(index, newColumnWidth);
        });

        this.__modelForDrag = new Backbone.Model();
        this.listenTo(this.__modelForDrag, 'dragleave', this.__onModelDragLeave);
    },

    template: Handlebars.compile(template),

    className: 'grid-header',

    tagName: 'tr',

    ui: {
        gridHeaderColumn: '.grid-header-column',
        checkbox: '.js-checkbox',
        dots: '.js-dots',
        index: '.js-index',
        cellSelection: '.js-cell_selection'
    },

    events: {
        'click @ui.checkbox': '__handleCheckboxClick',
        'pointerdown .grid-header-dragger': '__handleDraggerMousedown',
        'pointerdown .js-collapsible-button': '__toggleCollapseAll',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        drop: '__handleDrop',
        'mouseenter .grid-header-column': '__handleColumnSelect',
        'click .grid-header-column-title': '__handleColumnSort',
        'click .js-help-text-region': '__handleHelpMenuClick',
        mouseleave: '__onMouseLeaveHeader'
    },

    constants: {
        MIN_COLUMN_WIDTH: 50
    },

    templateContext() {
        this.isEveryColumnSetPxWidth = true;
        return {
            columns: this.options.columns.map(column =>
                ({
                    ...column,
                    width: this.__getColumnWidth(column),
                    hiddenClass: classes.hiddenByTreeEditorClass
                })
            ),
            showCheckbox: this.options.showCheckbox && !!this.options.columns.length,
            cellClass: `js-cell_selection ${this.options.showRowIndex ? 'cell_selection-index' : 'cell_selection'}`
        };
    },

    __getColumnWidth(column): string {
        const width = column.width;
        if (!width) {
            this.isEveryColumnSetPxWidth = false;
            return '';
        }
        if (width > 1) {
            return `${width}px`;
        }
        this.isEveryColumnSetPxWidth = false;
        return `${column.width * 100}%`;
    },

    onRender() {
        if (!this.options.columns.length) {
            return;
        }
        if (this.options.isTree) {
            const expandOnShow = this.getOption('expandOnShow')
            this.$el
                .find('.header-column-wrp')[0]                
                .insertAdjacentHTML('afterbegin', `<i class="js-tree-first-cell collapsible-btn ${classes.collapsible}
                ${Handlebars.helpers.iconPrefixer('angle-down')} ${expandOnShow ? classes.expanded : ''}"></i/`);
            this.collapsed = !this.options.expandOnShow;
        }

        this.ui.gridHeaderColumn.each((i, el) => {
            const column = this.options.columns[i];
            const helpText = column.helpText;

            if (helpText) {
                this.addRegion(`popoutRegion${i}`, { el: el.querySelector('.js-help-text-region') });

                const infoPopout = Core.dropdown.factory.createPopout({
                    buttonView: InfoButtonView,
                    panelView: InfoMessageView,
                    panelViewOptions: {
                        text: helpText
                    },
                    popoutFlow: 'right',
                    customAnchor: true,
                    class: 'collection-grid-header__help'
                });
                this.showChildView(`popoutRegion${i}`, infoPopout);
            }
            this.__updateColumnSorting(column, el);
        });
    },

    updateSorting() {
        this.ui.gridHeaderColumn.each((i, el) => {
            const column = this.options.columns[i];
            this.__updateColumnSorting(column, el);
        });
    },

    __handleCheckboxClick() {
        this.collection.toggleCheckAll();
    },

    __handleColumnSort(event) {
        if (this.options.columnSort === false) {
            return;
        }
        if (event.target.className.includes('js-collapsible-button')) {
            return;
        }
        const column = this.options.columns[Array.prototype.indexOf.call(this.el.children, event.currentTarget.parentNode.parentNode) - this.columnIndexOffset];
        const sorting = column.sorting === 'asc' ? 'desc' : 'asc';
        this.options.columns.forEach(c => (c.sorting = null));
        column.sorting = sorting;
        let comparator = sorting === 'desc' ? column.sortDesc : column.sortAsc;
        if (!comparator) {
            comparator = helpers.comparatorFor(comparators.getComparatorByDataType(column.dataType || column.type, sorting), column.key);
        }
        if (comparator) {
            this.updateSorting();
            this.trigger('onColumnSort', column, comparator);
        }
    },

    __handleDraggerMousedown(e) {
        this.__stopDrag();
        this.__startDrag(e);
        this.trigger('header:columnResizeStarted');
        return false;
    },

    __getElementOuterWidth(el) {
        return el.getBoundingClientRect().width;
    },

    __startDrag(e: PointerEvent) {
        const dragger = e.target.parentNode;
        const columnElement = dragger.parentNode;

        const draggedColumn = {
            el: columnElement
        };

        this.dragContext = {
            pageOffsetX: e.pageX,
            dragger,
            draggedColumn
        };

        this.__updateColumnAndNeighbourWidths(columnElement);

        dragger.classList.add('active');

        document.addEventListener('pointermove', this.__draggerMouseMove);
        document.addEventListener('pointerup', this.__draggerMouseUp);
    },

    __stopDrag() {
        if (!this.dragContext) {
            return;
        }

        const draggerElement = this.dragContext.dragger;
        this.__triggerUpdateWidth();

        draggerElement.classList.remove('active');
        this.dragContext = null;

        document.removeEventListener('pointermove', this.__draggerMouseMove);
        document.removeEventListener('pointerup', this.__draggerMouseUp);
    },

    __draggerMouseMove(e: PointerEvent) {
        if (!this.dragContext) {
            return;
        }

        const ctx = this.dragContext;
        const delta = e.pageX - ctx.pageOffsetX;

        if (delta !== 0) {
            const index = ctx.draggedColumn.index;
            this.__setColumnWidth(index, this.dragContext.draggedColumn.initialWidth + delta);
        }

        return false;
    },

    __draggerMouseUp() {
        this.__stopDrag();

        this.trigger('header:columnResizeFinished');
        return false;
    },

    __triggerUpdateWidth() {
        const index = this.dragContext.draggedColumn.index;
        const columnElement = this.dragContext.draggedColumn.el;

        this.trigger('update:width', { index, newColumnWidth: this.__getElementOuterWidth(columnElement) });
    },

    onAttach() {
        this.trigger('set:emptyView:width', this.el.scrollWidth);
    },

    __setColumnWidth(index: number, newColumnWidth: number) {
        const currentWidth = this.options.columns[index].width;
        const newColumnWidthPX = `${newColumnWidth}px`;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH || newColumnWidth === currentWidth) {
            return;
        }


        this.options.columns[index].width = newColumnWidth;
        if (!this.isRendered()) {
            return;
        }
        const child = this.el.children[index + this.columnIndexOffset];
        child.style.minWidth = newColumnWidthPX;
        child.style.width = newColumnWidthPX;

        //this.trigger('update:width', index, newColumnWidth, this.el.scrollWidth);
        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);
        // this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
    },

    __updateColumnAndNeighbourWidths(column: HTMLElement) {
        for (let i = 0; i < this.options.columns.length - 1; i++) {
            const child = this.el.children[i + this.columnIndexOffset];
            const width = this.__getElementOuterWidth(child);

            if (child === column) {
                this.dragContext.draggedColumn.index = i;
                this.dragContext.draggedColumn.initialWidth = width;
            }
            // freeze width all columns in pix
            this.__setColumnWidth(i, width);
        }
        this.isEveryColumnSetPxWidth = true;
        this.trigger('change:isEveryColumnSetPxWidth');
    },

    __toggleCollapseAll() {
        this.__updateCollapseAll(!this.collapsed);
        this.gridEventAggregator.trigger('toggle:collapse:all', this.collapsed);
    },

    __updateCollapseAll(collapsed: Boolean) {
        this.collapsed = collapsed;
        this.$('.js-collapsible-button').toggleClass(classes.expanded, !collapsed);
    },

    __handleDragOver(event: MouseEvent) {
        // prevent default to allow drop
        event.preventDefault();
    },

    __handleDragEnter(event: DragEvent) {
        this.__setDragEnterModel(this.__modelForDrag);
    },

    __setDragEnterModel(model: Backbone.Model) {
        const previousDragEnterModel = this.collection.dragoverModel;
        if (previousDragEnterModel === model) {
            return;
        }

        previousDragEnterModel?.trigger('dragleave');
        this.collection.dragoverModel = model;

        if (this.__isDropAllowed()) {
            this.el.classList.add(classes.dragover);
        }
    },

    __handleDrop(event: DragEvent) {
        event.preventDefault();
        this.el.classList.remove(classes.dragover);
        if (this.__isDropAllowed()) {
            this.gridEventAggregator.trigger('drag:drop', this.collection.draggingModels, this.model);
        }
        delete this.collection.draggingModels;
    },

    __onModelDragLeave() {
        this.el.classList.remove(classes.dragover);
    },

    __isDropAllowed() {
        if (!this.collection.draggingModels || this.collection.draggingModels.some(draddingModel => this.collection.indexOf(draddingModel) < 1)) {
            return false;
        }
        return true;
    },

    __handleColumnSelect(event) {
        this.trigger('handleColumnSelect', {
            event,
            currentEl: event.currentTarget,
            relatedEl: event.relatedTarget,
            model: this.options.columns[Array.prototype.indexOf.call(this.el.children, event.currentTarget) - this.columnIndexOffset]
        });
    },

    __onMouseLeaveHeader(event) {
        this.trigger('handleLeave', event);
    },

    __updateColumnSorting(column, el) {
        requestAnimationFrame(() => {
            const oldSortingEl = el.querySelector('.js-sorting');
            if (oldSortingEl) {
                oldSortingEl.parentElement.removeChild(oldSortingEl);
            }

            const defaultSortingDirection = 'desc';
            const sortingDirection = column.sorting || defaultSortingDirection;

            const sortingClass = sortingDirection === 'desc' ? classes.sortingDown : classes.sortingUp;
            const selectedSortingClass = column.sorting && classes.selectedSorting;

            const sortingHTML = `<i class="js-sorting grid-header-column-sorting ${selectedSortingClass} ${Handlebars.helpers.iconPrefixer(sortingClass)}"></i>`;

            column.sorting && el.parentElement.classList.add(selectedSortingClass);
            el.querySelector('.grid-header-column-title').insertAdjacentHTML('beforeend', sortingHTML);
        });
    },

    __updateState(collection, state) {
        switch (state) {
            case 'checked':
                this.ui.checkbox.get(0).innerHTML = '<i class="fas fa-check"></i>';
                if (this.ui.cellSelection.get(0)) {
                    this.ui.cellSelection.get(0).classList.add(classes.has_checked);
                }
                break;
            case 'checkedSome':
                this.ui.checkbox.get(0).innerHTML = '<i class="fas fa-square"></i>';
                if (this.ui.cellSelection.get(0)) {
                    this.ui.cellSelection.get(0).classList.add(classes.has_checked);
                }
                break;
            case 'unchecked':
                if (this.ui.cellSelection.get(0)) {
                    this.ui.cellSelection.get(0).classList.remove(classes.has_checked);
                }
            default:
                this.ui.checkbox.get(0).innerHTML = '';
                break;
        }
    }
});

export default GridHeaderView;
