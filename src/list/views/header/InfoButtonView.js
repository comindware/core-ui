import template from '../../templates/infoButton.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'form-label__info-button fa fa-question-circle',

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: Core.dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor',
            omitDefaultStyling: true
        }
    }
});
