import SelectionCellView from './SelectionCellView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.gridEventAggregator = options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'update:height', this.__updateHeight);
        this.listenTo(this.gridEventAggregator, 'update:top', this.__updateTop);
    },

    className() {
        return `grid-selection-panel${this.options.showRowIndex ? ' cell_selection-index' : ''} ${this.options.checkboxColumnClass}`;
    },

    childView: SelectionCellView,

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

    _removeChildView(view) {
        this.children._remove(view);
        if (view.el.parentElement === this.el) {
            view.el.remove();
        }
        // to execute destroy logic after relayout on scroll
        setTimeout(() => Marionette.CollectionView.prototype._removeChildView.apply(this, arguments));
    },

    __updateHeight(height) {
        this.$el.css({ height });
    },

    __updateTop(top) {
        this.el.style.paddingTop = `${top}px`;
    }
});
