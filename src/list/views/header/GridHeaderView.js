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
        'click .grid-header-column-title': '__handleColumnSort',
        'click .js-help-text-region': '__handleHelpMenuClick',
        mouseleave: '__onMouseLeaveHeader'
    },

    constants: {
        MIN_COLUMN_WIDTH: 50
    },

    templateContext() {
        return {
            columns: this.options.columns.map(column =>
                Object.assign({}, column, {
                    sortingAsc: column.sorting === 'asc',
                    sortingDesc: column.sorting === 'desc'
                })
            )
        };
    },

    onRender() {
        if (this.options.isTree) {
            this.$el
                .children()[0]
                .insertAdjacentHTML(
                    'afterbegin',
                    `<span class="collapsible-btn js-collapsible-button ${this.getOption('expandOnShow') === true ? classes.expanded : ''}"></span>&nbsp;`
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
        });
    },

    updateSorting() {
        this.render();
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

    __getFullWidth() {
        return this.el.clientWidth;
    },

    onAttach() {
        this.trigger('set:emptyView:width', this.el.scrollWidth);
    },

    updateColumnAndNeighbourWidths(index, delta) {
        const newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
            return;
        }

        this.trigger('update:width', index, newColumnWidth, this.el.scrollWidth);

        this.gridEventAggregator.trigger('singleColumnResize', newColumnWidth);

        this.el.style.width = `${this.dragContext.tableInitialWidth + delta + 1}px`;
        this.options.columns[index].width = newColumnWidth;
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
        if ((!this.el.contains(event.relatedTarget) && this.collection.dragoverModel !== undefined) || event.relatedTarget.classList.contains('js-grid-content-view')) {
            this.collection.trigger('dragleave:head', event);
        }
    },

    __handleModelDragLeave() {
        this.el.parentElement && this.el.parentElement.classList.remove(classes.dragover);
    },

    __handleDrop(event) {
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
        this.trigger('handleColumnSelect', {
            event,
            el: event.currentTarget,
            model: this.options.columns[Array.prototype.indexOf.call(event.currentTarget.parentElement.children, event.currentTarget)]
        });
    },

    __onMouseLeaveHeader(event) {
        this.trigger('handleLeave', event);
    }
});

export default GridHeaderView;
