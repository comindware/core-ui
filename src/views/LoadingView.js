import template from './templates/loading.hbs';

export default Marionette.View.extend({
    templateContext() {
        return {
            text: this.options.text
        };
    },

    template: Handlebars.compile(template),

    className: 'l-loader'
});
