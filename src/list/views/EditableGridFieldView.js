//@flow
import FieldView from '../../form/fields/FieldView';
import template from '../templates/editableCellField.hbs';

export default class extends FieldView {
    onRender() {
        this.showChildView('editorRegion', this.editor);
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
        if (this.schema.getReadonly || this.schema.getHidden) {
            this.__updateExternalChange();
        }
    }
}
