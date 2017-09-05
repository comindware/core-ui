/**
 * Developer: Ksenia Kartvelishvili
 * Date: 28.11.2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */


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
            behaviorClass: Core.list.views.behaviors.ListItemViewBehavior
        }
    },

    onHighlighted(fragment) {
        const text = Core.utils.htmlHelpers.highlightText(this.model.get('name'), fragment);
        this.ui.name.html(text);
    },

    onUnhighlighted() {
        this.ui.name.text(this.model.get('name'));
    },

    template: Handlebars.compile(template)
});
