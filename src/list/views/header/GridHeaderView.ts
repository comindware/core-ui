import { comparators, helpers } from 'utils/index';
import template from '../../templates/gridheader.hbs';
import InfoButtonView from './InfoButtonView';
import InfoMessageView from './InfoMessageView';
import Marionette from 'backbone.marionette';
import _ from 'underscore';
import { classes } from '../../meta';

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

        this.gridEventAggregator = options.gridEventAggregator;
        this.collection = options.gridEventAggregator.collection;

        this.styleSheet = options.styleSheet;
        this.columnIndexOffset = options.showCheckbox ? 1 : 0;
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleColumnSort');
        this.listenTo(this.gridEventAggregator, 'update:collapse:all', this.__updateCollapseAll);
        this.listenTo(this.collection, 'check:all check:none check:some', this.__updateState);
    },

    template: Handlebars.compile(template),

    className: 'grid-header',

    tagName: 'tr',

    ui: {
        gridHeaderColumn: '.grid-header-column',
        checkbox: '.js-checkbox',
        dots: '.js-dots',
        index: '.js-index'
    },

    events: {
        'click @ui.checkbox': '__handleCheckboxClick',
        'pointerdown .grid-header-dragger': '__handleDraggerMousedown',
        'pointerdown .js-collapsible-button': '__toggleCollapseAll',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
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
                fa fa-angle-down ${expandOnShow ? classes.expanded : ''}"></i/`);
            this.collapsed = !this.expandOnShow;
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
        this.offScreenWidth = 0;
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
        const deltaOffScreenWidth = 3;

        const ctx = this.dragContext;
        const index = ctx.draggedColumn.index;
        const widthBrawserWindow = window.innerWidth;
        const currentCoordinateX = e.pageX;
        let deltaX = currentCoordinateX - ctx.pageOffsetX;

        if (widthBrawserWindow - currentCoordinateX <= 2) {
            this.__increaseColumnWidth(index, deltaOffScreenWidth, deltaX);
            return false;
        }
        
        if (this.offScreenWidth > 0) {
            this.__subtractionColumnWidth(index, deltaOffScreenWidth, deltaX);
            return false;
        }

        if (deltaX !== 0) {
            this.__setColumnWidth(index, this.dragContext.draggedColumn.initialWidth + deltaX);
        }

        return false;
    },

    __subtractionColumnWidth(index: any, deltaOffScreenWidth: any, deltaX: any) {
        this.offScreenWidth -= deltaOffScreenWidth;
        const newWidthColumn = this.dragContext.draggedColumn.initialWidth + deltaX + this.offScreenWidth;
        this.__setColumnWidth(index, newWidthColumn);
    },

    __increaseColumnWidth(index: any, deltaOffScreenWidth: any, deltaX: any) {
        this.offScreenWidth += deltaOffScreenWidth;
        const newWidthColumn = this.dragContext.draggedColumn.initialWidth + deltaX + this.offScreenWidth;
        this.__setColumnWidth(index, newWidthColumn);
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

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH || newColumnWidthPX === currentWidth) {
            return;
        }

        this.el.children[index + this.columnIndexOffset].style.minWidth = newColumnWidthPX;
        this.el.children[index + this.columnIndexOffset].style.width = newColumnWidthPX;
        this.options.columns[index].width = newColumnWidth;

        //this.trigger('update:width', index, newColumnWidth, this.el.scrollWidth);
        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);
        // this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
    },

    __updateColumnAndNeighbourWidths(column: HTMLElement) {
        for (let i = 0; i < this.options.columns.length; i++) {
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
        if (!this.collection.draggingModel) {
            return;
        }
        // prevent default to allow drop
        event.preventDefault();
    },

    __handleDragEnter(event: MouseEvent) {
        if (this.__allowDrop()) {
            this.el.classList.add(classes.dragover);
        }
    },

    __handleDragLeave(event: MouseEvent) {
        if (this.__allowDrop()) {
            this.el.classList.remove(classes.dragover);
        }
    },

    __handleDrop(event: MouseEvent) {
        event.preventDefault();
        if (this.__allowDrop()) {
            this.el.classList.remove(classes.dragover);
            this.gridEventAggregator.trigger('drag:drop', this.collection.draggingModel);
            delete this.collection.draggingModel;
        }
    },

    __allowDrop() {
        if (!this.collection.draggingModel || this.collection.indexOf(this.collection.draggingModel) < 0) {
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
            if (column.sorting) {
                const sortingClass = column.sorting === 'asc' ? classes.sortingDown : classes.sortingUp;
                const sortingHTML = `<i class="js-sorting ${Handlebars.helpers.iconPrefixer(sortingClass)}"></i>`;
                el.querySelector('.js-help-text-region').insertAdjacentHTML('beforebegin', sortingHTML);
            }
        });
    },

    __updateState(collection, state) {
        switch (state) {
            case 'checked':
                this.ui.checkbox.get(0).innerHTML = '<i class="fas fa-check"></i>';
                break;
            case 'checkedSome':
                this.ui.checkbox.get(0).innerHTML = '<i class="fas fa-square"></i>';
                break;
            case 'unchecked':
            default:
                this.ui.checkbox.get(0).innerHTML = '';
                break;
        }
    }
});

export default GridHeaderView;
