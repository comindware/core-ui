
import template from '../templates/workSpaceItemGroup.html';

export default Marionette.View.extend({
    className: 'mselect__group',

    template: Handlebars.compile(template)
});
