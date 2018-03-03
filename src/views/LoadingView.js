import template from '../templates/loading.hbs';

export default Marionette.ItemView.extend({
    templateHelpers() {
        return {
            text: this.options.text
        };
    },

    template: Handlebars.compile(template),

    className: 'l-loader'
});
