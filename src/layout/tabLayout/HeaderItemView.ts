// @flow
import template from './templates/headerItem.hbs';

export default Marionette.View.extend({
    tagName: 'li',

    className() {
        return `layout__tab-layout__header-view-item ${this.model.get('tabClass') || ''}`;
    },

    attributes() {
        return { ...(this.model?.get('description') ? { title: this.model.get('description') } : {}) };
    },

    template: Handlebars.compile(template),

    events: {
        click: '__onClick'
    },

    modelEvents: {
        'change:selected change:error change:enabled change:visible': 'render',
        'change:selected': '__onSelectedChange'
    },

    onRender() {
        this.$el.toggleClass('layout__tab-layout__header-view-item_selected', Boolean(this.model.get('selected')));
        this.$el.toggleClass('layout__tab-layout__header-view-item_error', Boolean(this.model.get('error')));
        this.$el.toggleClass('layout__tab-layout__header-view-item_disabled', !this.model.get('enabled'));
        this.$el.toggleClass('layout__tab-layout__header-view-item_hidden', !this.model.get('visible'));

        this.el.setAttribute('id', this.model.id);
    },

    __onClick() {
        if (this.model.get('enabled')) {
            this.trigger('select', this.model);
        }
    },

    __onSelectedChange(model: Backbone.Model, selected: boolean) {
        if (selected) {
            this.__scrollIntoView();
        }
    },

    // native scrollIntoView causing the whole page to move,
    // to prevent that behaviour we need to use scrollIntoViewOptions,
    // but Edge, IE, and Safari doesn't support scrollIntoViewOptions.
    __scrollIntoView() {
        if (!this.__isUiReady()) {
            return;
        }
        const offsetLeft = this.el.offsetLeft;
        this.$el.offsetParent().animate({ scrollLeft: offsetLeft }, 1000);
    },

    __isUiReady() {
        return this.isRendered() && !this.isDestroyed() && this.isAttached();
    }
});
