/**
 * Developer: Ksenia Kartvelishvili
 * Date: 12.02.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/popoutPanelItem.html';

export default Marionette.CompositeView.extend({
    initialize() {
        _.bindAll(this, '__onItemTitleClick', '__onItemIconClick');

        this.collection = this.model.get('children');
    },

    template: Handlebars.compile(template),

    className: 'left-menu__list-g',

    ui: {
        itemIcon: '.js-item-toggle-icon',
        itemTitle: '.js-item-title'
    },

    classes: {
        titleSelected: 'js-item-title-selected data-source__text_selected',
        collapsed: 'data-source_collapsed'
    },

    modelEvents: {
        collapsed: '__onModelCollapsed',
        expanded: '__onModelExpanded'
    },

    events: {
        'click @ui.itemIcon': '__onItemIconClick',
        'click @ui.itemTitle': '__onItemTitleClick'
    },

    childEvents: {
        'path:select': '__onChildItemTitleSelect',
        'item:toggle': '__onChildItemToggle'
    },

    childViewContainer: '.js-items-container',

    onRender() {
        this.__updateSelection();
        this.__updateChildren(true);
    },

    __onModelCollapsed() {
        this.__updateChildren();
    },

    __onModelExpanded() {
        this.__updateChildren();
    },

    __onItemIconClick() {
        this.model.toggleCollapsed();
        return false;
    },

    __updateSelection() {
        const selected = this.model.getSelected();
        if (selected) {
            this.ui.itemTitle.addClass(this.classes.titleSelected);
        } else {
            this.ui.itemTitle.removeClass(this.classes.titleSelected);
        }
        this.trigger('item:select', selected);
    },

    __updateChildren(noTrigger) {
        if (!this.model.get('hasChildren')) return;

        const collapsed = this.model.getCollapsed();
        if (collapsed) {
            this.$el.children(this.childViewContainer).hide();
            this.$el.addClass(this.classes.collapsed);
        } else {
            this.$el.children(this.childViewContainer).show();
            this.$el.removeClass(this.classes.collapsed);
        }
        if (!noTrigger) {
            this.trigger('item:toggle', collapsed);
        }
    },

    __onChildItemToggle(parentView, collapsed) {
        this.trigger('item:toggle', collapsed);
    },

    __onItemTitleClick() {
        if (this.model.checkPropertyType({ type: this.model.get('type') }, false)) {
            this.trigger('path:select', this.model.getPath());
        }
        return false;
    },

    __onChildItemTitleSelect(parentView, selected) {
        this.trigger('path:select', selected);
    }
});
