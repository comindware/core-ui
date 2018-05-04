//@flow
import { comparators, helpers } from 'utils';
import GridColumnHeaderView from './GridColumnHeaderView';
import template from '../templates/gridheader.hbs';
import GlobalEventService from '../../services/GlobalEventService';

/*
*
* Fires: columnsResize(this, { changes: { 0: 0.5, 1: 0.5 } })
*
* */

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
 * @param {Backbone.View} options.gridColumnHeaderView View используемый для отображения заголовка (шапки) списка
 * */

/*eslint-disable*/

const classes = {
    expanded: 'collapsible-btn_expanded',
    dragover: 'dragover'
};

const GridHeaderView = Marionette.View.extend({
    initialize(options) {
        if (!options.columns) {
            throw new Error('You must provide columns definition ("columns" option)');
        }
        if (!options.gridEventAggregator) {
            throw new Error('You must provide grid event aggregator ("gridEventAggregator" option)');
        }

        this.gridEventAggregator = options.gridEventAggregator;
        this.gridColumnHeaderView = options.gridColumnHeaderView || GridColumnHeaderView;
        this.gridColumnHeaderViewOptions = options.gridColumnHeaderViewOptions;
        this.columns = options.columns;
        this.collection = options.gridEventAggregator.collection;

        this.styleSheet = options.styleSheet;
        this.listenTo(this.collection, 'dragover:head', this.__handleModelDragOver);
        this.listenTo(this.collection, 'dragleave:head', this.__handleModelDragLeave);
        this.listenTo(this.collection, 'drop:head', this.__handleModelDrop);
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResizeInternal', '__handleColumnSort', 'handleResize');
        this.listenTo(GlobalEventService, 'window:resize', this.handleResize);
        this.listenTo(this.gridEventAggregator, 'update:collapse:all', this.__updateCollapseAll);
    },

    template: Handlebars.compile(template),

    className: 'grid-header',

    ui: {
        gridHeaderColumn: '.grid-header-column'
    },

    events: {
        'mousedown .grid-header-dragger': '__handleDraggerMousedown',
        'click .js-collapsible-button': '__toggleCollapseAll',
        dragover: '__handleDragOver',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop'
    },

    constants: {
        MIN_COLUMN_WIDTH: 50
    },

    templateContext() {
        return {
            columns: this.columns
        };
    },

    onRender() {
        if (this.__columnEls) {
            this.__columnEls.forEach(c => c.destroy());
        }
        this.__columnEls = [];

        let isFirstChild = true;
        this.collapsed = !this.getOption('expandOnShow');

        this.ui.gridHeaderColumn.each((i, el) => {
            const column = this.columns[i];
            const view = new this.gridColumnHeaderView(
                Object.assign(this.gridColumnHeaderViewOptions || {}, {
                    title: column.title,
                    column,
                    gridEventAggregator: this.gridEventAggregator
                })
            );
            this.__columnEls.push(view);
            this.listenTo(view, 'columnSort', this.__handleColumnSort);
            el.appendChild(view.render().el);
            if (this.options.isTree && isFirstChild) {
                view.el.insertAdjacentHTML('afterbegin', `<span class="collapsible-btn js-collapsible-button ${
                    this.collapsed === false ? classes.expanded : ''}"></span>`);
                isFirstChild = false;
            }
            el.classList.add(`${this.getOption('uniqueId')}-column${i}`);
        });

        // if (this.options.expandOnShow) {
        //     this.__updateCollapseAll(false);
        // }
    },

    onAttach() {
        this.__handleResizeInternal();
    },

    onDestroy() {
        if (this.__columnEls) {
            this.__columnEls.forEach(c => c.destroy());
        }
    },

    updateSorting() {
        this.render();
        this.__handleResizeInternal();
    },

    __handleColumnSort(sender, args) {
        const column = args.column;
        const sorting = column.sorting === 'asc' ? 'desc' : 'asc';
        this.columns.forEach(c => (c.sorting = null));
        column.sorting = sorting;
        let comparator = sorting === 'desc' ? column.sortDesc : column.sortAsc;
        if (!comparator) {
            comparator = helpers.comparatorFor(comparators.getComparatorByDataType(column.type, sorting), column.key);
        }
        if (comparator) {
            this.updateSorting();
            this.trigger('onColumnSort', column, comparator);
        }
    },

    __handleDraggerMousedown(e) {
        this.__stopDrag();
        this.__startDrag(e);
        return false;
    },

    __getElementOuterWidth(el) {
        return el.getBoundingClientRect().width;
    },

    __startDrag(e) {
        const dragger = e.target;
        const column = dragger.parentNode;

        const draggedColumn = {
            el: column,
            initialWidth: this.__getElementOuterWidth(column),
            index: Array.prototype.indexOf.call(column.parentNode.children, column)
        };

        this.dragContext = {
            pageOffsetX: e.pageX,
            dragger,
            draggedColumn
        };

        dragger.classList.add('active');

        document.addEventListener('mousemove', this.__draggerMouseMove);
        document.addEventListener('mouseup', this.__draggerMouseUp);
    },

    __stopDrag() {
        if (!this.dragContext) {
            return;
        }

        this.dragContext.dragger.classList.remove('active');
        this.dragContext = null;

        document.removeEventListener('mousemove', this.__draggerMouseMove);
        document.removeEventListener('mouseup', this.__draggerMouseUp);
    },

    __draggerMouseMove(e) {
        if (!this.dragContext) {
            return;
        }

        const ctx = this.dragContext;
        const delta = e.pageX - ctx.pageOffsetX;

        if (delta !== 0) {
            const index = ctx.draggedColumn.index;

            this.updateColumnAndNeighbourWidths(index, delta);
        }

        return false;
    },

    __draggerMouseUp() {
        this.__stopDrag();
        return false;
    },

    handleResize() {
        if (this.isDestroyed()) {
            return;
        }
        this.__handleResizeInternal();
        this.gridEventAggregator.trigger('columnsResize');
    },

    __getFullWidth() {
        return this.el.clientWidth;
    },

    __handleResizeInternal() {
        this.ui.gridHeaderColumn.each(i => {
            this.__setColumnWidth(i, this.columns[i].width);
        });
    },

    updateColumnAndNeighbourWidths(index, delta) {
        const newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
            return;
        }
        // this.ui.gridHeaderColumn[index].style.width = `${newColumnWidth}px`;
        this.__setColumnWidth(index, newColumnWidth);

        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);

        this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
        this.columns[index].width = newColumnWidth;
    },

    __setColumnWidth(index, width = 0) {
        const style = this.styleSheet;
        const selector = `.${this.getOption('uniqueId')}-column${index}`;
        const regexp = new RegExp(`${selector} { flex: [0,1] 0 [+, -]?\\S+\\.?\\S*; } `);
        let basis;
        if (width > 0) {
            if (width < 1) {
                basis = `${width * 100}%`;
            } else {
                basis = `${width}px`;
            }
        } else {
            basis = '0%';
        }

        const grow = width > 0 ? 0 : 1;
        const newValue = `${selector} { flex: ${grow} 0 ${basis}; } `;

        if (regexp.test(style.innerHTML)) {
            style.innerHTML = style.innerHTML.replace(regexp, newValue);
        } else {
            style.innerHTML += newValue;
        }
    },

    __toggleCollapseAll() {
        this.__updateCollapseAll(!this.collapsed);
        this.gridEventAggregator.trigger('toggle:collapse:all', this.collapsed);
    },

    __updateCollapseAll(collapsed) {
        this.collapsed = collapsed;
        this.$('.js-collapsible-button').toggleClass(classes.expanded, !collapsed);
    },
    __handleDragOver(event) {
        if (!this.collection.draggingModel) {
            return;
        }
        this.collection.trigger('dragover:head', event);
        event.preventDefault();
    },

    __handleModelDragOver() {
        this.el.parentElement && this.el.parentElement.classList.add(classes.dragover);
    },

    __handleDragLeave(event) {
        this.collection.trigger('dragleave:head', event);
    },

    __handleModelDragLeave() {
        this.el.parentElement && this.el.parentElement.classList.remove(classes.dragover);
    },

    __handleDrop(event) {
        this.collection.trigger('drop:head', event);
    },

    __handleModelDrop() {
        this.el.parentElement && this.el.parentElement.classList.remove(classes.dragover);
        if (this.collection.draggingModel) {
            this.trigger('drag:drop', this.collection.draggingModel, this.model);
        }
    }
});

export default GridHeaderView;
