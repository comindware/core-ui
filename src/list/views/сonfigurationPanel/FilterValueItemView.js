import FilterEditorsFactory from '../../services/FilterEditorsFactory';
import { Field } from '../../../form';

export default Marionette.CollectionView.extend({
    className: 'dataset-options-editor dev-dataset-options-editor',

    childViewEvents: {
        render: '__onChildRender',
        destroy: '__onChildDestroy'
    },

    __onChildRender(fieldView) {
        this.listenTo(fieldView.editor, 'change', () => this.trigger('change'));
    },

    __onChildDestroy(fieldView) {
        this.stopListening(fieldView.editor, 'change');
    },

    childView: Field,

    childViewOptions(model) {
        const filtersConfigurationModel = this.getOption('filtersConfigurationModel');
        const editorOptions = FilterEditorsFactory.getFilterEditorOptions(filtersConfigurationModel, model, this.options.parentModel);
        return Object.assign(
            {
                schema: editorOptions
            },
            editorOptions
        );
    }
});
