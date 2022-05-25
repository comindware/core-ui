// @flow

/*
 * This class is fully compatible with Backbone.Form.editors.Base and should be used to create Marionette-based editors for Backbone.Form
 * */

const defaultOptions = () => ({
    emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.PLACEHOLDER'),
    readonlyPlaceholder: '–'
});

import MarionetteEditorPrototype from './MarionetteEditorPrototype';

const BaseEditorView = Marionette.View.extend(MarionetteEditorPrototype(Marionette.View));

export default BaseEditorView.extend({
    constructor() {
        this.options = this.options || {};

        _.defaults(this.options, defaultOptions());
        BaseEditorView.prototype.constructor.apply(this, arguments);
    },

    __onEditorRender() {
        BaseEditorView.prototype.__onEditorRender.apply(this, arguments);
        if (!this.ui?.input) {
            return;
        }
        this.updatePlaceholder();
    },

    setPermissions(enabled, readonly) {
        BaseEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.updatePlaceholder();
    },

    updatePlaceholder(placeholder = this.__placeholderShouldBe()) {
        typeof this.ui?.input?.prop === 'function' && this.ui.input.prop('placeholder', placeholder);
    },

    __placeholderShouldBe() {
        return this.getEditable() ? this.options.emptyPlaceholder : this.options.readonlyPlaceholder;
    }
});
