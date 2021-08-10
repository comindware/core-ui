//@flow
import template from '../templates/radioButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className() {
        return `editor editor_radiobutton ${this.options.class || ''}`;
    },

    focusElement: null,

    attributes() {
        return {
            title: this.model.get('title') || this.model.get('displayText')
        };
    },

    initialize(options) {
        this.enabled = options.enabled;
    },

    classes: {
        checked: 'editor_checked'
    },

    modelEvents: {
        selected: '__toggle',
        deselected: '__toggle'
    },

    events: {
        click: '__changeModelSelected'
    },

    onRender() {
        if (this.model.get('id') === this.options.selected) {
            this.model.select();
        }
    },

    __toggle() {
        this.$el.toggleClass(this.classes.checked, this.model.selected);
    },

    __changeModelSelected() {
        if (!this.enabled) {
            return;
        }
        this.model.select();
    },

    setEnabled(enabled) {
        this.enabled = enabled;
    }
});
