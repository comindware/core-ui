import SelectionCellView from './SelectionCellView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.gridEventAggregator = options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'update:height', this.__updateHeight);
        this.listenTo(this.gridEventAggregator, 'update:top', this.__updateTop);
    },

    className() {
        return `grid-selection-panel${this.options.showRowIndex ? ' cell_selection-index' : ''}`;
    },

    childView: SelectionCellView,

    ui: {
        checkbox: '.js-checkbox',
        dots: '.js-dots',
        index: '.js-index'
    },

    events: {
        'click @ui.checkbox': '__handleCheckboxClick',
        'dragstart @ui.dots': '__handleDragStart',
        'dragend @ui.dots': '__handleDragEnd',
        click: '__handleClick',
        dblclick: '__handleDblClick',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop',
        mouseenter: '__handleMouseEnter',
        mouseleave: '__handleMouseLeave',
        contextmenu: '__handleContextMenu'
    },

    modelEvents: {
        'update:model': '__updateIndex',
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        dragover: '__handleModelDragOver',
        dragleave: '__handleModelDragLeave',
        drop: '__handleModelDrop',
        mouseenter: '__handleModelMouseEnter',
        mouseleave: '__handleModelMouseLeave',
        blink: '__blink',
        checked: '__addCheckedClass',
        unchecked: '__removeCheckedClass'
    },

    _showCollection() {
        const models = this.collection.visibleModels;

        models.forEach((child, index) => {
            this._addChild(child, index);
        });
        this.children._updateLength();
    },

    // override default method to correct add when index === 0 in visible collection
    _onCollectionAdd(child, collection, opts) {
        let index = opts.at !== undefined && opts.index;

        if (this.filter || index === false) {
            index = this._filteredSortedModels(index).indexOf(child);
        }

        if (this._shouldAddChild(child, index)) {
            this._destroyEmptyView();
            this._addChild(child, index);
        }
    },

    __updateHeight(height) {
        this.$el.css({ height });
    },

    __updateTop(top) {
        this.el.style.paddingTop = `${top}px`;
    }
});
