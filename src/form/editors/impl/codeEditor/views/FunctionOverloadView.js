import list from 'list';
import template from '../templates/functionOverload.html';

export default Marionette.ItemView.extend({
    className: 'dev-code-editor-tooltip-title',

    template: Handlebars.compile(template),

    behaviors: {
        ListItemViewBehavior: {
            behaviorClass: list.views.behaviors.ListItemViewBehavior
        }
    },

    triggers: {
        dblclick: 'peek'
    },

    modelEvents: {
        selected: '__onSelected'
    },

    __onSelected() {
        this.trigger('selected');
    }
});
