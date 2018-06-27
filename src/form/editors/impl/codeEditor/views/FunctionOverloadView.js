import list from 'list';
import template from '../templates/functionOverload.html';

export default Marionette.View.extend({
    className: 'dev-code-editor-tooltip-title',

    template: Handlebars.compile(template),

    behaviors: [ list.views.behaviors.ListItemViewBehavior],

    triggers: {
        dblclick: 'peek'
    },

    modelEvents: {
        selected: '__onSelected'
    },

    __onSelected() {
        this.trigger('selected', this.model);
    }
});
