import template from '../templates/functionParameters.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template)
});
