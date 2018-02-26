
import template from '../templates/toolbarCheckboxItem.html';

const classes = {
    CHECKED: 'editor_checked'
};

export default Marionette.ItemView.extend({
    initialize() {
        this.isShowAliases = this.options.model.get('isShowAliases');
    },

    className: 'toolbar-btn',

    template: Handlebars.compile(template),

    ui: {
        check: '.js-check'
    },

    onRender() {
        if (this.isShowAliases) {
            this.ui.check.toggleClass(classes.CHECKED);
        }
    },

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        this.isShowAliases = !this.isShowAliases;
        this.ui.check.toggleClass(classes.CHECKED);
        this.trigger('action:click', this.model);
    }
});
