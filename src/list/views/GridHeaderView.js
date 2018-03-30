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
        this.$document = $(document);
        this.styleSheet = options.styleSheet;
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResizeInternal', '__handleColumnSort', 'handleResize');
        this.listenTo(GlobalEventService, 'window:resize', this.handleResize);
        this.listenTo(this.gridEventAggregator, 'update:collapse:all', this.__updateCollapseAll);
    },

    template: Handlebars.compile(template),

    className: 'grid-header',

    ui: {
        gridHeaderColumn: '.grid-header-column',
        gridHeaderColumnContent: '.grid-header-column-content-view'
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
        this.ui.gridHeaderColumnContent.each((i, el) => {
            const column = this.columns[i];
            const view = new this.gridColumnHeaderView(_.extend(this.gridColumnHeaderViewOptions || {}, {
                model: column.viewModel,
                column,
                gridEventAggregator: this.gridEventAggregator
            }));
            this.__columnEls.push(view);
            this.listenTo(view, 'columnSort', this.__handleColumnSort);
            el.appendChild(view.render().el);
            if (this.options.isTree && isFirstChild && !column.viewModel.get('isCheckboxColumn')) {
                view.el.insertAdjacentHTML('afterbegin', `<span class="collapsible-btn js-collapsible-button"></span>`);
                isFirstChild = false;
            }
        });
        this.ui.gridHeaderColumn.each((i, el) => {
            el.classList.add(`${this.getOption('uniqueId')}-column${i}`);
        });
        this.__handleResizeInternal();
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
        const sorting = column.sorting;
        let comparator;
        this.columns.forEach(c => c.sorting = null);
        switch (sorting) {
            case 'asc':
                column.sorting = 'desc';
                comparator = column.sortDesc;
                break;
            case 'desc':
                column.sorting = 'asc';
                comparator = column.sortAsc;
                break;
            default:
                column.sorting = 'asc';
                comparator = column.sortAsc;
                break;
        }
        this.updateSorting();

        this.trigger('onColumnSort', column, comparator);
    },

    __handleDraggerMousedown(e) {
        this.__stopDrag();
        this.__startDrag(e);
        return false;
    },

    __getElementOuterWidth(el) {
        return $(el)[0].getBoundingClientRect().width;
    },

    __startDrag(e) {
        const $dragger = $(e.target);
        const $column = $dragger.parent();

        const affectedColumns = _.chain($column.nextAll()).toArray().map(el => ({
            $el: $(el),
            initialWidth: this.__getElementOuterWidth(el)
        })).value();
        const draggedColumn = {
            $el: $column,
            initialWidth: this.__getElementOuterWidth($column),
            index: $column.index()
        };
        const unaffectedWidth = _.reduce($column.prevAll(), (m, v) => m + this.__getElementOuterWidth(v), 0);
        const fullWidth = this.__getFullWidth();

        this.dragContext = {
            pageOffsetX: e.pageX,
            $dragger,
            fullWidth,
            unaffectedWidth,
            draggedColumn,
            affectedColumns,
            maxColumnWidth: fullWidth - affectedColumns.length * this.constants.MIN_COLUMN_WIDTH - unaffectedWidth
        };

        $dragger.addClass('active');
        this.$document.mousemove(this.__draggerMouseMove).mouseup(this.__draggerMouseUp);
    },

    __stopDrag() {
        if (!this.dragContext) {
            return;
        }

        this.dragContext.$dragger.removeClass('active');
        this.dragContext = null;
        this.$document.unbind('mousemove', this.__draggerMouseMove);
        this.$document.unbind('mouseup', this.__draggerMouseUp);
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
    //
    // __getFullWidth() {
    //     return this.$el.parent().width() - this.getOption('checkBoxPadding') - 2; // Magic cross browser pixels, don't remove them;
    // },

    __getFullWidth() {
        return this.el.parentElement ? this.el.parentElement.offsetWidth : 0;
    },

    __handleResizeInternal() {
        // Grid header's full width
        const fullWidth = this.__getFullWidth();
        if (fullWidth < 1) {
            _.delay(() => this.__handleResizeInternal(), 100);
            return;
        }
        const columnsWithDefinedWidth = this.columns.filter(column => column.width);

        let definedSumWidth = 0;
        columnsWithDefinedWidth.forEach(col => {
            col.absWidth = Math.floor(col.width > 1 ? col.width : col.width * fullWidth); // Calculate absolute custom column width (rounding it down)
            definedSumWidth += col.absWidth;
        });
        // Default column width
        const defaultColumnWidth = (fullWidth - definedSumWidth) / (this.columns.length - columnsWithDefinedWidth.length);
        let sumWidth = 0;
        // Columns' sum width

        // this.$el.width(fullWidth);


        // Iterate all but first columns counting their sum width
        this.ui.gridHeaderColumn.not(':last').each(i => {
            //const child = $(el);
            const col = this.columns[i];
            if (!col.width) {
                col.absWidth = Math.floor(defaultColumnWidth); // Otherwise take default column width (rounding it down)
                sumWidth += col.absWidth; // And add it to columns' sum width
            }
            // child.outerWidth(col.absWidth); // Set absolute column width
            this.__setColumnWidth(i, col.absWidth);
        });
        
        // Take remaining (or only) first column to calculate it's absolute width as difference between grid header's full width and
        // other columns' sum width. This logic is necessary because other columns' widths may have been rounded down during calculations
        if (this.columns.length) {
            const lastIndex = this.columns.length - 1;
            this.columns[lastIndex].absWidth = Math.floor(fullWidth - definedSumWidth - sumWidth); // Calculate remainig (or only) first column's absolute width);
            this.__setColumnWidth(lastIndex, this.columns[lastIndex].absWidth);
        }
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
        if (!width) {
            return;
        }
        let style = this.styleSheet;
        const selector = `.${this.getOption('uniqueId')}-column${index}`;
        const regexp = new RegExp(`${selector} { width: [+, -]?\\d+\\.?\\d*px; } `);
        const newValue = `${selector} { width: ${width}px; } `;
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
