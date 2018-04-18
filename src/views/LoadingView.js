import template from '../templates/loading.hbs';

export default Marionette.View.extend({
    templateHelpers() {
        return {
            text: this.options.text
        };
    },

    template: Handlebars.compile(template),

    className: 'l-loader'
});
