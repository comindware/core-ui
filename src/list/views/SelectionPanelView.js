//@flow
import SelectionCellView from './SelectionCellView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.gridEventAggregator = options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'update:height', this.__updateHeight);
    },

    className: 'grid-selection-panel',

    childView: SelectionCellView,

    _showCollection() {
        const models = this.collection.visibleModels;

        models.forEach((child, index) => {
            this._addChild(child, index);
        });
        this.children._updateLength();
    },

    onRender() {
        // todo: find way to remove it
        if (this.options.showRowIndex) {
            this.el.classList.add('cell_selection-index');
        }
    },

    __updateHeight(height) {
        this.$el.height(height);
    }
});
