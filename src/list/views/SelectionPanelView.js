import SelectionCellView from './SelectionCellView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.gridEventAggregator = options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'update:height', this.__updateHeight);
    },

    className: 'grid-selection-panel',

    childView: SelectionCellView,

    __updateHeight(height) {
        this.$el.height(height);
    }
});
