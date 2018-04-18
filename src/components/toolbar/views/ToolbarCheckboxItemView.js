import template from '../templates/toolbarCheckboxItem.html';

const classes = {
    CHECKED: 'editor_checked'
};

export default Marionette.ItemView.extend({
    className: 'toolbar-btn',

    template: Handlebars.compile(template),

    ui: {
        check: '.js-check'
    },

    onRender() {
        if (this.model.get('isActive')) {
            this.ui.check.toggleClass(classes.CHECKED);
        }
    },

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        const oldState = this.model.get('isActive');
        this.model.set('isActive', !oldState);
        this.ui.check.toggleClass(classes.CHECKED);
        this.trigger('action:click', this.model);
    }
});
