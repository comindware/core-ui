//@flow
import dropdown from 'dropdown';
import template from '../templates/errorButton.hbs';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    className: 'form-label__error-button',

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor',
            omitDefaultStyling: true
        }
    }
});
