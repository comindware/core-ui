//@flow
import dropdown from 'dropdown';
import template from '../templates/errorButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'js-field-error-button form-label__error-button fa fa-exclamation-circle',
    tagName: 'i',

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor',
            omitDefaultStyling: true
        }
    }
});
