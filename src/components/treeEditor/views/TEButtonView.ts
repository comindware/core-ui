import template from '../templates/TEButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'tree-editor-btn toolbar-btn',

    templateContext() {
        return {
            iconClass: this.options.iconClass
        };
    },

    show() {
        this.$el.show();
    },

    hide() {
        this.$el.hide();
    }
});
