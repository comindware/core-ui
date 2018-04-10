//@flow
import template from '../templates/actionMenuButton.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template)
});
