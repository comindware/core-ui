import form from 'form';
import template from '../templates/editableCell.hbs';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor'
    },

    onRender() {
        const model = this.model.get('columnConfig').viewModel.get('selectableCollection').get(this.model.get('rowModel'));
        const selectEditor = new form.editors.BooleanEditor({
            value: model ? model.selected : false
        });

        this.listenTo(selectEditor, 'change', editorView => {
            if (editorView.getValue()) {
                model.collection.select(model);
            } else {
                model.collection.deselect(model);
            }
        });

        this.listenTo(model, 'selected', () => selectEditor.setValue(true));
        this.listenTo(model, 'deselected', () => selectEditor.setValue(false));
        this.editorRegion.show(selectEditor);
    }
});
