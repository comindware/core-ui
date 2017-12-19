import form from 'form';
import template from '../templates/editableCell.hbs';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor'
    },

    onRender() {
        const rowModel = this.model.get('rowModel');
        const checkedEditor = new form.editors.BooleanEditor({
            value: rowModel ? rowModel.checked : false
        });

        this.listenTo(checkedEditor, 'change', editorView => {
            if (editorView.getValue()) {
                rowModel.collection.check(rowModel);
            } else {
                rowModel.collection.uncheck(rowModel);
            }
        });

        this.listenTo(rowModel, 'checked', () => checkedEditor.setValue(true));
        this.listenTo(rowModel, 'unchecked', () => checkedEditor.setValue(false));
        this.editorRegion.show(checkedEditor);
    }
});
