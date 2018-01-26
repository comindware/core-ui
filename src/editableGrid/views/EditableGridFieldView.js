/**
 * Created by sguryev on 05.09.2017.
 */

import form from 'form';
import editableCellField from '../templates/editableCellField.hbs';

export default form.Field.extend({
    template: Handlebars.compile(editableCellField),

    onRender() {
        this.editorRegion.show(this.editor);
        this.__rendered = true;
        this.setRequired(this.schema.required);
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
    },

    setError(msg) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.addClass('error');
        this.$('.js-field-error')[0].setAttribute('title', msg);
    },
    clearError() {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.removeClass('error');
        this.$('.js-field-error')[0].removeAttribute('title');
    }
});
