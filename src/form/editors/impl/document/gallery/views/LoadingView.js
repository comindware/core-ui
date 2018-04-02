//@flow
import template from '../templates/loading.html';

export default Marionette.ItemView.extend({

    template: Handlebars.compile(template),

    className: 'l-loader'
});
