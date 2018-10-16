import FilterEditorsFactory from '../../services/FilterEditorsFactory';

export default Marionette.CollectionView.extend({
    className: 'dataset-options-editor dev-dataset-options-editor',

    buildChildView(model) {
        return FilterEditorsFactory.getFilterEditor(this.getOption('filtersConfigurationModel'), model);
    }
});
