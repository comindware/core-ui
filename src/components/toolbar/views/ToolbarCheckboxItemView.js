//@flow
import template from '../templates/toolbarCheckboxItem.html';
import meta from '../meta';

const classes = {
    CHECKED: 'editor_checked'
};

export default Marionette.View.extend({
    className: meta.className,

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
        this.model.set('isChecked', newState);
        this.trigger('action:click', this.model);
    }
});
