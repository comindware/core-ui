//@flow
import template from '../templates/loading.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'l-loader'
});
