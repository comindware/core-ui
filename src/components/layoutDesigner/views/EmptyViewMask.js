//@flow
import template from '../templates/emptyViewMask.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'region'
});
