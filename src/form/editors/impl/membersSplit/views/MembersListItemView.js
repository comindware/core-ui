import list from 'list';
import { htmlHelpers } from 'utils';
import template from '../templates/membersListItem.html';

export default Marionette.View.extend({
    templateContext() {
        return {
            isGroup: this.model.get('type') === 'groups'
        };
    },

    ui: {
        name: '.js-name'
    },

    behaviors: [ list.views.behaviors.ListItemViewBehavior],

    onHighlighted(fragment) {
        const text = htmlHelpers.highlightText(this.model.get('name'), fragment);
        this.ui.name.html(text);
    },

    onUnhighlighted() {
        this.ui.name.text(this.model.get('name'));
    },

    template: Handlebars.compile(template)
});
