import { comparators, helpers } from 'utils/index';
import template from '../../templates/gridheader.hbs';
import InfoButtonView from './InfoButtonView';
import InfoMessageView from './InfoMessageView';

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

const classes = {
    expanded: 'collapsible-btn_expanded',
    dragover: 'dragover',
    sortingUp: 'arrow-up',
    sortingDown: 'arrow-down'
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
        drop: '__handleDrop',
        'mouseover .grid-header-column': '__handleColumnSelect',
        'click .grid-header-column': '__handleColumnSelect',
        'click .grid-header-column-title': '__handleColumnSort',
        'click .js-help-text-region': '__handleHelpMenuClick',
        mouseleave: '__onMouseLeaveHeader'
    },

    constants: {
        MIN_COLUMN_WIDTH: 50
    },

    templateContext() {
        return {
            columns: this.options.columns
        };
    },

    onRender() {
        if (this.options.isTree) {
            this.$el.children()[0].insertAdjacentHTML(
                'afterbegin',
                `<i class="js-tree-first-cell js-collapsible-button collapsible-btn ${classes.collapsible}
                    fa fa-angle-down ${this.getOption('expandOnShow') ? classes.expanded : ''}"></i/`
            );
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

    __handleColumnSort(event) {
        if (this.options.columnSort === false) {
            return;
        }
        if (event.target.className.includes('js-collapsible-button')) {
            return;
        }
        const column = this.options.columns[Array.prototype.indexOf.call(event.currentTarget.parentElement.parentElement.children, event.currentTarget.parentElement)];
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
        this.trigger('header:columnResizeFinished');
        return false;
    },

    getScrollWidth() {
        return this.scrollWidth || (this.scrollWidth = this.el.scrollWidth);
    },

    onAttach() {
        this.trigger('set:emptyView:width', this.getScrollWidth());
    },

    updateColumnAndNeighbourWidths(index, delta) {
        const newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
            return;
        }


        this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);
        this.options.columns[index].width = newColumnWidth;
        this.trigger('update:width', index, newColumnWidth, this.el.scrollWidth);
        this.scrollWidth = this.el.scrollWidth;
        this.trigger('change:scrollWidth');
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
        event.preventDefault();
    },

    __handleDragEnter(event) {
        this.collection.dragoverModel = undefined;
        if (this.__allowDrop()) {
            this.collection.trigger('dragover:head', event);
        }
    },

    __handleModelDragOver() {
        this.el.parentElement && this.el.parentElement.classList.add(classes.dragover);
    },

    __handleDragLeave(event) {
        if (this.collection.dragoverModel !== undefined) {
            this.collection.trigger('dragleave:head', event);
        }
    },

    __handleModelDragLeave() {
        this.el.parentElement && this.el.parentElement.classList.remove(classes.dragover);
    },

    __handleDrop(event) {
        event.preventDefault();
        if (this.__allowDrop()) {
            this.collection.trigger('drop:head', event);
        }
    },

    __allowDrop() {
        if (!this.collection.draggingModel || this.collection.indexOf(this.collection.draggingModel) < 0) {
            return false;
        }
        return true;
    },

    __handleModelDrop() {
        this.el.parentElement && this.el.parentElement.classList.remove(classes.dragover);
        if (this.collection.draggingModel) {
            this.trigger('drag:drop', this.collection.draggingModel, this.model);
        }
    },

    __handleColumnSelect(event) {
        const { currentTarget } = event;
        if (!document.body.contains(currentTarget)) {
            return;
        }
        this.trigger('handleColumnSelect', {
            event,
            el: currentTarget,
            model: this.options.columns[Array.prototype.indexOf.call(currentTarget.parentElement.children, currentTarget)]
        });
    },

    __onMouseLeaveHeader(event) {
        this.trigger('handleLeave', event);
    },

    __updateColumnSorting(column, el) {
        const oldSortingEl = el.querySelector('.js-sorting');
        if (oldSortingEl) {
            oldSortingEl.parentElement.removeChild(oldSortingEl);
        }
        if (column.sorting) {
            const sortingClass = column.sorting === 'asc' ? classes.sortingDown : classes.sortingUp;
            const sortingHTML = `<i class="js-sorting ${Handlebars.helpers.iconPrefixer(sortingClass)}"></i>`;
            el.querySelector('.js-help-text-region').insertAdjacentHTML('beforebegin', sortingHTML);
        }
    }
});

export default GridHeaderView;
