import { comparators, helpers } from 'utils/index';
import template from '../../templates/gridheader.hbs';
import InfoButtonView from './InfoButtonView';
import InfoMessageView from './InfoMessageView';
import { hiddenByUserClass } from '../../meta';

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

const THROTTLE_DELAY = 100;

const classes = {
    expanded: 'collapsible-btn_expanded',
    dragover: 'dragover',
    headerDragover: 'header-dragover',
    moveColumnDragger: 'js-move-column-dragger',
    eyeOpened: 'eye',
    eyeClosed: 'eye-slash'
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

        this.listenTo(this.collection, 'dragover:head', this.__handleModelDragOver);
        this.listenTo(this.collection, 'dragleave:head', this.__handleModelDragLeave);
        this.listenTo(this.collection, 'drop:head', this.__handleModelDrop);
        _.bindAll(this, '__draggerMouseUp', '__handleColumnSort');
        this.listenTo(this.gridEventAggregator, 'update:collapse:all', this.__updateCollapseAll);

        this.__handleThrottledMouseMove = _.throttle(this.__draggerMouseMove.bind(this), THROTTLE_DELAY);
    },

    template: Handlebars.compile(template),

    className: 'grid-header',

    ui: {
        gridHeaderColumn: '.grid-header-column',
        columnMoveDragger: `.${classes.moveColumnDragger}`
    },

    events: {
        'mousedown .js-resize-column-dragger': '__handleDraggerMousedown',
        'mousedown @ui.columnMoveDragger': '__initDragContext',
        'click .js-collapsible-button': '__toggleCollapseAll',
        'click .js-visibility-btn': '__toggleColumnVisibility',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop',
        dragend: '__handleDragEnd',
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
        const isEditModeString = Boolean(this.options.model.get('editMode')).toString();
        return {
            columns: this.options.columns.map(column => {
                let headerColumnClass = column.columnClass;
                if (column.hidden) {
                    if (!headerColumnClass.match(new RegExp(hiddenByUserClass))) {
                        headerColumnClass += ` ${hiddenByUserClass}`;
                    }
                } else {
                    headerColumnClass = headerColumnClass.replace(new RegExp(hiddenByUserClass));
                }

                return Object.assign({}, column, {
                    sortingAsc: column.sorting === 'asc',
                    sortingDesc: column.sorting === 'desc',
                    eyeIconClass: column.hidden ? classes.eyeOpened : classes.eyeClosed,
                    isEditModeString,
                    headerColumnClass
                });
            })
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

    __toggleColumnVisibility(event) {
        const element = event.target.parentElement;
        const columnIndex = this.__getColumnIndex(element);
        const column = this.options.columns[columnIndex];

        column.hidden = !column.hidden;
        this.render();
        this.trigger('column:set:visibility', { columnIndex, hidden: column.hidden });
    },

    __getColumnIndex(element) {
        return Array.from(element.parentElement.children).indexOf(element);
    },

    __handleColumnSort(event) {
        if (this.options.model && this.options.model.get('editMode')) {
            return;
        }
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

    __initDragContext(e) {
        const dragger = e.target;
        const isHeaderColumn = dragger.classList.contains('js-dropable');
        if (isHeaderColumn && !this.options.model.get('editMode')) {
            return;
        }

        const column = dragger.parentNode;
        const draggedColumn = {
            el: column,
            initialWidth: this.__getElementOuterWidth(column),
            index: Array.prototype.indexOf.call(column.parentNode.children, column)
        };

        this.dragContext = {
            pageOffsetX: e.pageX,
            dragger,
            draggedColumn,
            isHeaderColumn
        };
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
        this.__initDragContext(e);

        this.dragContext.dragger.classList.add('active');

        document.addEventListener('mousemove', this.__handleThrottledMouseMove);
        document.addEventListener('mouseup', this.__draggerMouseUp);
    },

    __stopDrag() {
        if (!this.dragContext) {
            return;
        }

        this.dragContext.dragger.classList.remove('active');
        this.dragContext = null;

        document.removeEventListener('mousemove', this.__handleThrottledMouseMove);
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

    onAttach() {
        this.trigger('set:emptyView:width', this.el.scrollWidth);
    },

    updateColumnAndNeighbourWidths(index, delta) {
        const newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
            return;
        }

        this.trigger('update:width', index, newColumnWidth, this.el.scrollWidth);

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

    __handleModelDragLeave() {
        this.el.parentElement && this.el.parentElement.classList.remove(classes.dragover);
    },

    __handleModelDragOver() {
        this.el.parentElement && this.el.parentElement.classList.add(classes.dragover);
    },

    __handleDragOver(event) {
        if (this.collection.draggingModel || event.target.classList.contains('js-dropable')) {
            event.preventDefault();
        }
    },

    __handleDragEnter(event) {
        const target = this.__getTargetColumn(event.target);
        if (target === this.__getTargetColumn(this.dragContext.draggedColumn.el)) {
            return;
        }
        event.preventDefault();
        this.dragContext.previousDragOver = target;
        if (this.dragContext && this.dragContext.isHeaderColumn) {
            target.classList.add(classes.headerDragover);
            return;
        }

        this.collection.dragoverModel = undefined;
        if (this.__allowDrop()) {
            this.collection.trigger('dragover:head', event);
        }
    },

    __handleDragLeave(event) {
        const target = this.__getTargetColumn(event.target);

        if (this.dragContext.previousDragOver === target) {
            return;
        }
        if (this.dragContext && this.dragContext.isHeaderColumn) {
            target.classList.remove(classes.headerDragover);
            return;
        }
        if (this.collection.dragoverModel !== undefined) {
            this.collection.trigger('dragleave:head', event);
        }
    },

    __handleDrop(event) {
        event.preventDefault();
        const target = this.__getTargetColumn(event.target);
        if (this.dragContext && this.dragContext.isHeaderColumn) {
            target.classList.remove(classes.headerDragover);

            const sourceColumn = this.__getTargetColumn(this.dragContext.dragger);
            this.trigger('column:move', { oldIndex: this.__getColumnIndex(sourceColumn), newIndex: this.__getColumnIndex(target) });

            return;
        }
        if (this.__allowDrop()) {
            this.collection.trigger('drop:head', event);
        }
    },

    __handleDragEnd(event) {
        if (!this.dragContext.previousDragOver) {
            return;
        }
        this.__getTargetColumn(this.dragContext.previousDragOver).classList.remove(classes.headerDragover);
        delete this.dragContext;
    },

    __getTargetColumn(target) {
        if (target.classList.contains('grid-header')) {
            return target.childNodes[0];
        }
        if (target.classList.contains('grid-header-column')) {
            return target;
        }
        return target.parentElement;
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
        const parentElement = event.currentTarget.parentElement;
        if (!parentElement) {
            return;
        }
        this.trigger('handleColumnSelect', {
            event,
            el: event.currentTarget,
            model: this.options.columns[Array.prototype.indexOf.call(parentElement.children, event.currentTarget)]
        });
    },

    __onMouseLeaveHeader(event) {
        this.trigger('handleLeave', event);
    }
});

export default GridHeaderView;
