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
 * @extends Marionette.ItemView
 * @param {Object} options Constructor options
 * @param {Array} options.columns массив колонок
 * @param {Object} options.gridEventAggregator ?
 * @param {Backbone.View} options.gridColumnHeaderView View используемый для отображения заголовка (шапки) списка
 * */

/*eslint-disable*/

const classes = {
    expanded: 'collapsible-btn_expanded'
};

const GridHeaderView = Marionette.ItemView.extend({
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

        this.styleSheet = options.styleSheet;
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
        'click .js-collapsible-button': '__toggleCollapseAll'
    },

    constants: {
        MIN_COLUMN_WIDTH: 50
    },

    templateHelpers() {
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
        this.ui.gridHeaderColumn.each((i, el) => {
            const column = this.columns[i];
            const view = new this.gridColumnHeaderView(Object.assign(this.gridColumnHeaderViewOptions || {}, {
                title: column.title,
                column,
                gridEventAggregator: this.gridEventAggregator
            }));
            this.__columnEls.push(view);
            this.listenTo(view, 'columnSort', this.__handleColumnSort);
            el.appendChild(view.render().el);
            if (this.options.isTree && isFirstChild) {
                view.el.insertAdjacentHTML('afterbegin', `<span class="collapsible-btn js-collapsible-button"></span>`);
                isFirstChild = false;
            }
            el.classList.add(`${this.getOption('uniqueId')}-column${i}`);
        });

        // if (this.options.expandOnShow) {
        //     this.__updateCollapseAll(false);
        // }
        this.collapsed = !this.getOption('expandOnShow');
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
        this.columns.forEach(c => c.sorting = null);
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
        if (this.isDestroyed) {
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
            this.__setColumnWidth(i, this.columns[i].width || 1);
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

    __setColumnWidth(index, width) {
        const style = this.styleSheet;
        const selector = `.${this.getOption('uniqueId')}-column${index}`;
        const regexp = new RegExp(`${selector} { flex: [+, -]?\\S+\\.?\\S* 0 0; } `);
        const newValue = `${selector} { flex: ${width}${width > 1 ? 'px' : ''} 0 0; } `;

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
    }
});

export default GridHeaderView;
