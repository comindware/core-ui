
import template from '../templates/toolbarCheckboxItem.html';

const classes = {
    CHECKED: 'editor_checked'
};

export default Marionette.ItemView.extend({
    initialize() {
        this.isActive = this.options.model.get('isActive');
    },

    className: 'toolbar-btn',

    template: Handlebars.compile(template),

    ui: {
        check: '.js-check'
    },

    onRender() {
        if (this.isActive) {
            this.ui.check.toggleClass(classes.CHECKED);
        }
    },

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        this.isActive = !this.isActive;
        this.ui.check.toggleClass(classes.CHECKED);
        this.trigger('action:click', this.model);
    }
});
