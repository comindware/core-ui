
import template from '../templates/header.hbs';
import GlobalEventService from '../../services/GlobalEventService';

/**
 * @name HeaderView
 * @memberof module:core.nativeGrid.views
 * @class HeaderView
 * @description View заголовка списка
 * @extends Marionette ItemView
 * @param {Object} options Constructor options
 * @param {Array} options.columns Массив колонок
 * @param {Object} options.gridEventAggregator ?
 * @param {Backbone.View} options.gridColumnHeaderView View Используемый для отображения заголовка (шапки) списка
 * */

const expandedClass = 'collapsible-btn_expanded';

export default Marionette.View.extend({
    constants: {
        MIN_COLUMN_WIDTH: 100
    },

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
        this.styleSheet = options.styleSheet;
        this.$document = $(document);
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResizeInternal', '__handleColumnSort', 'handleResize');
        this.collapsed = true;
        this.listenTo(GlobalEventService, 'window:resize', this.handleResize);
        this.listenTo(this.gridEventAggregator, 'update:collapse:all', this.__updateCollapseAll);
    },
    /**
     * View template
     * @param {HTML} HTML file
     * */
    template: Handlebars.compile(template),

    className: 'grid-header',

    ui: {
        gridHeaderColumn: '.grid-header-column',
        gridHeaderColumnContent: '.grid-header-column-content-view'
    },

    events: {
        'mousedown .grid-header-dragger': '__handleDraggerMousedown',
        'click .collapsible-btn': '__toggleCollapseAll'
    },

    onRender() {
        if (this.__columnEls) {
            this.__columnEls.forEach(c => c.destroy());
        }
        this.__columnEls = [];

        let isFirstChild = true;
        this.ui.gridHeaderColumnContent.each((i, el) => {
            const column = this.columns[i];
            const view = new this.gridColumnHeaderView(Object.assign(this.gridColumnHeaderViewOptions || {}, {
                model: column.viewModel,
                column,
                gridEventAggregator: this.gridEventAggregator
            }));
            this.__columnEls.push(view);
            this.listenTo(view, 'columnSort', this.__handleColumnSort);
            el.appendChild(view.render().el);
            if (this.options.isTree && isFirstChild && !column.viewModel.get('isCheckboxColumn')) {
                this.collapseButton = $('<span class="collapsible-btn"></span>');
                view.$el.prepend(this.collapseButton);
                isFirstChild = false;
            }
        });
        this.ui.gridHeaderColumn.each((i, el) => {
            el.classList.add(`${this.getOption('uniqueId')}-column${i}`);
        });
        this.headerMinWidth = this.__getAvailableWidth();
        this.__setInitialWidth(this.headerMinWidth);
        this.__handleResizeInternal();
        if (this.options.expandOnShow) {
            this.__updateCollapseAll(false);
        }
    },

    setFitToView() {
        const availableWidth = this.__getAvailableWidth();
        const viewWidth = this.__getTableWidth();
        const columnsL = this.ui.gridHeaderColumn.length;
        let fullWidth = 0;
        let sumDelta = 0;
        let sumGap = 0;
        let columnWidth;

        this.ui.gridHeaderColumn.each((i, el) => {
            if (availableWidth !== viewWidth) {
                columnWidth = this.__getElementOuterWidth(el) * availableWidth / viewWidth;
                if (columnWidth < this.constants.MIN_COLUMN_WIDTH) {
                    sumDelta += this.constants.MIN_COLUMN_WIDTH - columnWidth;
                    columnWidth = this.constants.MIN_COLUMN_WIDTH;
                } else {
                    sumGap += columnWidth - this.constants.MIN_COLUMN_WIDTH;
                }
            }

            this.columns[i].width = columnWidth;
        });

        this.ui.gridHeaderColumn.each(i => {
            if (availableWidth !== viewWidth) {
                if (this.columns[i].width > this.constants.MIN_COLUMN_WIDTH) {
                    this.columns[i].width -= (this.columns[i].width - this.constants.MIN_COLUMN_WIDTH) * sumDelta / sumGap;
                }
            }

            if (i === columnsL - 1 && fullWidth + this.columns[i].width < availableWidth) {
                this.columns[i].width = availableWidth - fullWidth;
            }

            //el.style.width = `${this.columns[i].width}px`;
            this.styleSheet.innerHTML.replace(new RegExp(`.${this.getOption('uniqueId')}-column${i} { flex-basis: \\d+px; } `),
                `.${this.getOption('uniqueId')}-column${i} { flex-basis: ${this.columns[i].width}px; } `);
            fullWidth += this.columns[i].width;
        });
        this.el.style.width = `${Math.ceil(fullWidth)}px`;
    },

    updateColumnAndNeighbourWidths(index, delta) {
        const newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
            return;
        }
        // this.ui.gridHeaderColumn[index].style.width = `${newColumnWidth}px`;
        this.styleSheet.innerHTML = this.styleSheet.innerHTML.replace(new RegExp(`.${this.getOption('uniqueId')}-column${index} { flex-basis: \\d+px; } `),
            `.${this.getOption('uniqueId')}-column${index} { flex-basis: ${newColumnWidth}px; } `);

        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);

        this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
        this.columns[index].width = newColumnWidth;
    },

    updateDragContext($column, offset) {
        this.dragContext = this.dragContext || {};

        const draggedColumn = {
            $el: $column,
            initialWidth: this.__getElementOuterWidth($column[0]),
            index: $column.index()
        };

        this.dragContext.tableInitialWidth = this.__getTableWidth();
        this.gridEventAggregator.trigger('columnStartDrag', draggedColumn.index);

        this.dragContext.fullWidth = this.headerMinWidth;
        this.dragContext.draggedColumn = draggedColumn;
        this.dragContext.pageOffsetX = offset;
    },

    templateContext() {
        return {
            columns: this.columns
        };
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

    handleResize() {
        if (this.isDestroyed) {
            return;
        }
        this.__handleResizeInternal();
        this.gridEventAggregator.trigger('columnsResize');
    },

    __getAvailableWidth() {
        return this.gridEventAggregator.$el.width();
    },

    __getElementOuterWidth(el) {
        return el.getBoundingClientRect().width;
    },

    __setInitialWidth(availableWidth) {
        const columnsL = this.ui.gridHeaderColumn.length;
        const columnWidthData = this.__getColumnsWidthData(availableWidth, this.columns);
        let fullWidth = 0;

        this.ui.gridHeaderColumn.each(i => {
            const columnWidth = columnWidthData[i];

            if (i === columnsL - 1 && fullWidth + this.columns[i].width < availableWidth) {
                this.columns[i].width = availableWidth - fullWidth;
            }
            //el.style.width = `${columnWidth}px`;
            this.styleSheet.innerHTML += `.${this.getOption('uniqueId')}-column${i} { flex-basis: ${columnWidth}px; } `;


            this.columns[i].width = columnWidth;
            fullWidth += columnWidth;
        });
        this.el.style.width = `${fullWidth}px`;
    },

    __getColumnsWidthData(availableWidth, columns) {
        const columnWidthData = [];
        let availableDynamicWidth = availableWidth;
        let nonStaticColumnsCount = columns.length;

        this.ui.gridHeaderColumn.each((i, el) => {
            let columnWidth;
            if (columns[i].width) {
                columnWidth = columns[i].width;
                --nonStaticColumnsCount;
            } else {
                columnWidth = Math.max(el.getBoundingClientRect().width, this.constants.MIN_COLUMN_WIDTH);
            }
            availableDynamicWidth -= columnWidth;
            columnWidthData.push(columnWidth);
        });

        if (availableDynamicWidth > 0) {
            const columnAdditionalWidth = availableDynamicWidth / nonStaticColumnsCount;
            columns.forEach((column, i) => {
                if (!column.width) {
                    columnWidthData[i] += columnAdditionalWidth;
                }
            });
        }

        return columnWidthData;
    },

    __startDrag(e) {
        const $dragger = $(e.target);
        const $column = $dragger.parent();

        this.updateDragContext($column, e.pageX);
        this.dragContext.tableInitialWidth = this.__getTableWidth();

        this.dragContext.$dragger = $dragger;

        $dragger.addClass('active');
        if (this.dragContext) {
            this.$document.mousemove(this.__draggerMouseMove).mouseup(this.__draggerMouseUp);
        }
    },

    __stopDrag() {
        if (!this.dragContext) {
            return;
        }

        this.dragContext.$dragger.removeClass('active');
        this.dragContext = null;
        this.$document.unbind('mousemove', this.__draggerMouseMove);
        this.$document.unbind('mouseup', this.__draggerMouseUp);

        this.gridEventAggregator.trigger('columnStopDrag');
    },

    __draggerMouseMove(e) {
        const ctx = this.dragContext;
        const delta = e.pageX - ctx.pageOffsetX;

        if (delta !== 0) {
            const index = ctx.draggedColumn.index;

            this.updateColumnAndNeighbourWidths(index, delta);
        }

        return false;
    },

    __getTableWidth() {
        return this.$el.width() - 1;
    },

    __handleResizeInternal() {
        const fullWidth = this.__getAvailableWidth();
        const currentWidth = this.__getTableWidth();

        if (fullWidth > currentWidth) {
            this.$el.width(fullWidth);
        }
        this.headerMinWidth = fullWidth;
        this.__updateColumnsWidth();
    },

    __updateColumnsWidth() {
        const columns = this.columns;
        let needUpdate = false;
        let fullWidth = 0;

        this.ui.gridHeaderColumn.each(i => {
            //const child = $(el);
            const col = columns[i];
            if (col.width) {
                needUpdate = true;
                // child.outerWidth(col.width);
                this.styleSheet.innerHTML.replace(new RegExp(`.${this.getOption('uniqueId')}-column${i} { flex-basis: \\d+px; } `),
                    `.${this.getOption('uniqueId')}-column${i} { flex-basis: ${this.columns[i].width}px; } `);
                fullWidth += col.width;
            }
        });

        needUpdate && this.$el.width(fullWidth);
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

    __draggerMouseUp() {
        this.__stopDrag();
        return false;
    },

    __getFullWidth() {
        return this.$el.parent().width() - 2; // Magic cross browser pixels, don't remove them
    },

    __toggleCollapseAll() {
        this.__updateCollapseAll(!this.collapsed);
        this.gridEventAggregator.trigger('toggle:collapse:all', this.collapsed);
    },

    __updateCollapseAll(collapsed) {
        this.collapsed = collapsed;
        if (this.collapseButton) {
            this.collapseButton.toggleClass(expandedClass, !collapsed);
        }
    }
});
