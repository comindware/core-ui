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

const GridHeaderView = Marionette.ItemView.extend({
    initialize(options) {
        if (!options.columns) {
            throw new Error('You must provide columns definition ("columns" option)');
        }
        if (!options.gridEventAggregator) {
            throw new Error('You must provide grid event aggregator ("gridEventAggregator" option)');
        }
        if (!options.gridColumnHeaderView) {
            throw new Error('You must provide grid column header view ("gridColumnHeaderView" option)');
        }

        this.gridEventAggregator = options.gridEventAggregator;
        this.gridColumnHeaderView = options.gridColumnHeaderView;
        this.gridColumnHeaderViewOptions = options.gridColumnHeaderViewOptions;
        this.columns = options.columns;
        this.$document = $(document);
        this.styleSheet = options.styleSheet;
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResizeInternal', '__handleColumnSort', 'handleResize');
        this.listenTo(GlobalEventService, 'window:resize', this.handleResize);
    },

    template: Handlebars.compile(template),

    className: 'grid-header',

    ui: {
        gridHeaderColumn: '.grid-header-column',
        gridHeaderColumnContent: '.grid-header-column-content-view'
    },

    events: {
        'mousedown .grid-header-dragger': '__handleDraggerMousedown'
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

        this.ui.gridHeaderColumnContent.each((i, el) => {
            const column = this.columns[i];
            const view = new this.gridColumnHeaderView(_.extend(this.gridColumnHeaderViewOptions || {}, {
                model: column.viewModel,
                column
            }));
            this.__columnEls.push(view);
            this.listenTo(view, 'columnSort', this.__handleColumnSort);
            const childEl = view.render().el;
            el.appendChild(childEl);
        });
        this.ui.gridHeaderColumn.each((i, el) => {
            el.classList.add(`${this.getOption('uniqueId')}-column${i}`);
        });
    },

    onShow() {
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

        // const ctx = this.dragContext;
        // let delta = e.pageX - ctx.pageOffsetX;
        // if (delta !== 0) {
        //     const draggedColumn = ctx.draggedColumn;
        //     let index = ctx.draggedColumn.index;
        //     const changes = {};
        //
        //     this.columns[index].absWidth = Math.min(ctx.maxColumnWidth, Math.max(this.constants.MIN_COLUMN_WIDTH, draggedColumn.initialWidth + delta));
        //     delta = this.columns[index].absWidth - draggedColumn.initialWidth;
        //     // draggedColumn.$el.outerWidth(this.columns[index].absWidth);
        //     this.__setFlexBasis(index, this.columns[index].absWidth);
        //     var newColumnWidthPc = this.columns[index].absWidth / ctx.fullWidth;
        //     this.columns[index].width = newColumnWidthPc;
        //     changes[index] = this.columns[index].absWidth;
        //     index++;
        //
        //     const affectedColumnsWidth = ctx.fullWidth - ctx.unaffectedWidth - draggedColumn.initialWidth;
        //     var sumDelta = 0;
        //     let sumGap = 0;
        //
        //     for (let i = 0; i < ctx.affectedColumns.length; i++) {
        //         let c = ctx.affectedColumns[i],
        //             newColumnWidth = c.initialWidth - delta * c.initialWidth / affectedColumnsWidth;
        //
        //         if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
        //             sumDelta += this.constants.MIN_COLUMN_WIDTH - newColumnWidth;
        //             newColumnWidth = this.constants.MIN_COLUMN_WIDTH;
        //         } else {
        //             sumGap += newColumnWidth - this.constants.MIN_COLUMN_WIDTH;
        //         }
        //
        //         this.columns[index].absWidth = newColumnWidth;
        //         index++;
        //     }
        //
        //     let fullSum = 0;
        //     index = ctx.draggedColumn.index + 1;
        //     for (let i = 0; i < ctx.affectedColumns.length; i++) {
        //         const c = ctx.affectedColumns[i];
        //         if (sumDelta > 0 && this.columns[index].absWidth > this.constants.MIN_COLUMN_WIDTH) {
        //             const delta = (this.columns[index].absWidth - this.constants.MIN_COLUMN_WIDTH) * sumDelta / sumGap;
        //             this.columns[index].absWidth -= delta;
        //         }
        //
        //         fullSum += this.columns[index].absWidth;
        //
        //         if (i === ctx.affectedColumns.length - 1) {
        //             var sumDelta = ctx.fullWidth - ctx.unaffectedWidth - this.columns[ctx.draggedColumn.index].absWidth - fullSum;
        //             this.columns[index].absWidth += sumDelta;
        //         }
        //
        //         var newColumnWidthPc = this.columns[index].absWidth / ctx.fullWidth;
        //         this.columns[index].width = newColumnWidthPc;
        //         // c.$el.outerWidth(this.columns[index].absWidth);
        //         this.__setFlexBasis(index, this.columns[index].absWidth);
        //         changes[index] = this.columns[index].absWidth;
        //         index++;
        //     }
        //
        //     // this.$el.width(this.$el.width() + delta);
        //
        //     this.gridEventAggregator.trigger('columnsResize');
        // }

        // return false;
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
        return this.$el.parent().width() - this.getOption('checkBoxPadding');
    },

    __handleResizeInternal() {
        const fullWidth = this.__getFullWidth();
        if (!fullWidth) {
            _.delay(() => this.__handleResizeInternal(), 100);
            return;
        }
        // Grid header's full width
        const columnWidth = fullWidth / this.columns.length;
        // Default column width
        let sumWidth = 0;
        // Columns' sum width

        // this.$el.width(fullWidth);

        // Iterate all but first columns counting their sum width
        this.ui.gridHeaderColumn.not(':first').each(i => {
            //const child = $(el);
            const col = this.columns[i + 1];
            if (col.width) { // If column has it's custom width
                col.absWidth = Math.floor(col.width * fullWidth); // Calculate absolute custom column width (rounding it down)
            } else {
                col.absWidth = Math.floor(columnWidth); // Otherwise take default column width (rounding it down)
            }
            // child.outerWidth(col.absWidth); // Set absolute column width
            this.__setFlexBasis(i, col.absWidth);
            sumWidth += col.absWidth; // And add it to columns' sum width
        });
        
        // Take remaining (or only) first column to calculate it's absolute width as difference between grid header's full width and
        // other columns' sum width. This logic is necessary because other columns' widths may have been rounded down during calculations
        if (this.columns.length) {
            this.columns[0].absWidth = Math.floor(fullWidth - sumWidth); // Calculate remainig (or only) first column's absolute width);
            this.__setFlexBasis(0, this.columns[0].absWidth);
        }
    },

    updateColumnAndNeighbourWidths(index, delta) {
        const newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
            return;
        }
        // this.ui.gridHeaderColumn[index].style.width = `${newColumnWidth}px`;
        this.__setFlexBasis(index, newColumnWidth);

        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);

        this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
        this.columns[index].width = newColumnWidth;
    },

    __setFlexBasis(index, width) {
        if (!width) {
            return;
        }
        let style = this.styleSheet;
        const selector = `.${this.getOption('uniqueId')}-column${index}`;
        const regexp = new RegExp(`${selector} { flex-basis: [+, -]?\\d+\\.?\\d*px; } `);
        const newValue = `${selector} { flex-basis: ${width}px; } `;
        if (regexp.test(style.innerHTML)) {
            style.innerHTML = style.innerHTML.replace(regexp, newValue);
        } else {
            style.innerHTML += newValue;
        }
    }
});

export default GridHeaderView;
