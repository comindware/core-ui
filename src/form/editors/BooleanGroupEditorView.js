import template from './templates/booleanGroupEditor.html';
import BaseCompositeEditorView from './base/BaseCompositeEditorView';
import formRepository from '../formRepository';
import BooleanEditorView from './BooleanEditorView';

const defaultOptions = {
    displayText: '',
    thirdState: false
};

/**
 * @name BooleanGroupEditorView
 * @memberof module:core.form.editors
 * @class A simple Checkbox editor. Supported data type: <code>Boolean</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {String} [options.displayText] Text to the right of the checkbox. Click on text triggers the checkbox.
 * @param {String} [options.displayHtml] HTML content to the right of the checkbox. Click on it triggers the checkbox.
 * @param {String} [options.title] Title attribute for the editor.
 * @param {Boolean} [options.thirdState=false] Enables third state for checkbox.
 * */
export default (formRepository.editors.BooleanGroup = BaseCompositeEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        this.collection = new Backbone.Collection(options.items);
    },

    childViewContainer: '.js-checkbox-group_conianer',

    childView: BooleanEditorView,

    className: 'editor editor_checkbox',

    attributes() {
        return {
            title: this.options.title || null
        };
    },

    childViewOptions(model) {
        return model.toJSON();
    },

    template: Handlebars.compile(template),

    setValue(value) {
        if (this.value === value) {
            return;
        }
        this.value = value;
    },

    isEmptyValue() {
        return typeof this.getValue() !== 'boolean';
    },

    __setReadonly(readonly) {
        BaseCompositeEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled()) {
            this.$el.prop('tabindex', readonly ? -1 : 0);
        }
        Object.values(this.children._views).forEach(view => view.__setReadonly(readonly));
    }
}));
