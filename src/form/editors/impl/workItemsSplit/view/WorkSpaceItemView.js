

import template from '../templates/workSpaceListItem.html';

export default Marionette.ItemView.extend({
    initialize(options) {
        this.channel = options.channel;
    },

    ui: {
        name: '.js-name',
        up: '.js-up',
        down: '.js-down'
    },

    events: {
        'click @ui.up': 'onUpClick',
        'click @ui.down': 'onDownClick'
    },

    onRender() {
        if (this.options.left) {
            this.ui.up.hide();
            this.ui.down.hide();
        }
    },

    onUpClick() {
        this.channel.trigger('item:up', this.model);
    },

    onDownClick() {
        this.channel.trigger('item:down', this.model);
    },

    className: 'js-menu-select-item menu-bselect__item',

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
