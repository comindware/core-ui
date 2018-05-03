//@flow
import template from '../templates/toolbarCheckboxItem.html';

const classes = {
    CHECKED: 'editor_checked'
};

export default Marionette.View.extend({
    className: 'toolbar-btn',

    template: Handlebars.compile(template),

    ui: {
        check: '.js-check'
    },

    onRender() {
        if (this.model.get('isChecked')) {
            this.ui.check.toggleClass(classes.CHECKED);
        }
    },

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        const newState = !this.model.get('isChecked');
        this.trigger('action:click', this.model, newState);
        this.model.set('isChecked', newState);
    }
});
