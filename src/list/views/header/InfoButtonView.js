import template from '../../templates/infoButton.html';
import dropdown from 'dropdown';
import getIconPrefixer from '../../../utils/handlebars/getIconPrefixer';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className() {
        return `${getIconPrefixer('question-circle')('question-circle')}`;
    },

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor',
            omitDefaultStyling: true
        }
    }
});
