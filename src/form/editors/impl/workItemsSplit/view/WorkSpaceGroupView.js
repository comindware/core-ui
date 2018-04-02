//@flow
import template from '../templates/workSpaceItemGroup.html';

export default Marionette.ItemView.extend({
    className: 'mselect__group',

    template: Handlebars.compile(template)
});
