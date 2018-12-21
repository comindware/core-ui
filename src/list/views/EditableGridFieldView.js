//@flow
import FieldView from '../../form/fields/FieldView';
import template from '../templates/editableCellField.hbs';

export default FieldView.extend({
    template: Handlebars.compile(template),

    className: 'editable-grid-field',

    onRender() {
        this.showChildView('editorRegion', this.editor);
        this.setRequired(this.schema.required);
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
        if (this.schema.getReadonly || this.schema.getHidden) {
            this.__updateExternalChange();
        }
    }
});
