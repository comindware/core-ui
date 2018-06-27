//@flow
import template from '../templates/actionMenuButton.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template)
});
