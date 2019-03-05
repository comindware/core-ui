//@flow
import dropdown from 'dropdown';
import template from './templates/infoButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'form-label__info-button fa fa-question-circle',
    tagName: 'i',

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor',
            omitDefaultStyling: true
        }
    }
});
