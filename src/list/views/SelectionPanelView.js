import SelectionCellView from './SelectionCellView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.gridEventAggregator = options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'update:height', this.__updateHeight);
    },

    className: 'grid-selection-panel',

    childView: SelectionCellView,

    showCollection() {
        const models = this.collection.visibleModels;
        models.forEach((child, index) => {
            this.addChild(child, SelectionCellView, index);
        });
    },

    __updateHeight(height) {
        this.$el.height(height);
    }
});
