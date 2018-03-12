

import list from 'list';
import { htmlHelpers } from 'utils';
import template from '../templates/membersListItem.html';

export default Marionette.ItemView.extend({
    templateHelpers() {
        return {
            isGroup: this.model.get('type') === 'groups'
        };
    },

    ui: {
        name: '.js-name'
    },

    behaviors: {
        ListItemViewBehavior: {
            behaviorClass: list.views.behaviors.ListItemViewBehavior
        }
    },

    onHighlighted(fragment) {
        const text = htmlHelpers.highlightText(this.model.get('name'), fragment);
        this.ui.name.html(text);
    },

    onUnhighlighted() {
        this.ui.name.text(this.model.get('name'));
    },

    template: Handlebars.compile(template)
});
