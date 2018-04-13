import FieldView from '../../form/fields/FieldView';
import template from '../templates/editableCellField.hbs';

export default FieldView.extend({
    template: Handlebars.compile(template),

    className: 'editable-grid-field',

    onRender() {
        this.editorRegion.show(this.editor);
        this.__rendered = true;
        this.setRequired(this.schema.required);
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
    }
});
