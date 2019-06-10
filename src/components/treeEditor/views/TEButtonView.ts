import template from '../templates/TEButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            iconClass: this.options.iconClass
        };
    }
});
