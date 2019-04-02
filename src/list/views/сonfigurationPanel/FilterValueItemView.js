import FilterEditorsFactory from '../../services/FilterEditorsFactory';

export default Marionette.CollectionView.extend({
    className: 'dataset-options-editor dev-dataset-options-editor',

    template: Handlebars.compile(''), //cause can not init without template

    buildChildView(model) {
        return FilterEditorsFactory.getFilterEditor(this.getOption('filtersConfigurationModel'), model);
    }
});
