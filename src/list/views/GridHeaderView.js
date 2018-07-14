//@flow
import { comparators, helpers } from 'utils';
import GridColumnHeaderView from './GridColumnHeaderView';
import template from '../templates/gridheader.hbs';

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
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleColumnSort');
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
        dragenter: '__handleDragEnter',
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
            el.classList.add(column.columnClass);
        });

        if (this.options.isTree) {
            this.__columnEls[0].el.insertAdjacentHTML(
                'afterbegin',
                `<span class="collapsible-btn js-collapsible-button ${this.collapsed === false ? classes.expanded : ''}"></span>&nbsp;`
            );
        }

        // if (this.options.expandOnShow) {
        //     this.__updateCollapseAll(false);
        // }
    },

    onDestroy() {
        if (this.__columnEls) {
            this.__columnEls.forEach(c => c.destroy());
        }
    },

    updateSorting() {
        this.render();
    },

    __handleColumnSort(sender, args) {
        const column = args.column;
        const sorting = column.sorting === 'asc' ? 'desc' : 'asc';
        this.columns.forEach(c => (c.sorting = null));
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

    __getFullWidth() {
        return this.el.clientWidth;
    },

    updateColumnAndNeighbourWidths(index, delta) {
        const newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
            return;
        }

        this.trigger('update:width', index, newColumnWidth);

        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);

        this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
        this.columns[index].width = newColumnWidth;
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

    __handleDragEnter(event) {
        if (!this.collection.draggingModel) {
            return;
        }
        this.collection.dragoverModel = undefined;
        this.collection.trigger('dragover:head', event);
    },

    __handleModelDragOver() {
        this.el.parentElement && this.el.parentElement.classList.add(classes.dragover);
    },

    __handleDragLeave(event) {
        if (!this.el.contains(event.relatedTarget) && this.collection.dragoverModel !== this.model) {
            this.collection.trigger('dragleave:head', event);
        }
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
