import template from './templates/loading.hbs';
import Marionette from 'backbone.marionette';

export default Marionette.View.extend({
    templateContext() {
        return {
            text: this.options.text
        };
    },

    template: Handlebars.compile(template),

    className: 'l-loader'
});
