
import { severity } from '../meta';
import dropdown from 'dropdown';
import template from '../templates/actionMenuButton.html';

export default Marionette.ItemView.extend({
    className: 'toolbar-btn',

    template: Handlebars.compile(template),

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor'
        }
    },

    onRender() {
        this.$el.addClass(severity[this.model.get('severity')].class);
    }
});
