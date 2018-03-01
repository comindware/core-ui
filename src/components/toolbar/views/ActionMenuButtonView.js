
import dropdown from 'dropdown';
import template from '../templates/actionMenuButton.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor'
        }
    }
});
