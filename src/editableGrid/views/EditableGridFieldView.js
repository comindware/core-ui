import form from 'form';
import template from '../templates/editableCellField.hbs';

export default form.Field.extend({
    template: Handlebars.compile(template),

    className: 'editable-grid-field',

    onShow() {
        this.editorRegion.show(this.editor);
        this.__rendered = true;
        this.setRequired(this.schema.required);
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
    }
});
