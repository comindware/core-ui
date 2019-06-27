import template from '../templates/TEButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'js-tree-editor-btn tree-editor-btn',

    templateContext() {
        return {
            iconClass: this.options.iconClass
        };
    }
});
