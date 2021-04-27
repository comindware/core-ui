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
        'change:selected change:error change:enabled change:visible change:isHidden': '__applyClasses',
        'change:selected': '__onSelectedChange'
    },

    onRender() {
        this.__applyClasses();

        this.el.setAttribute('id', this.model.id);
    },

    onAttach() {
        if (this.model.get('selected')) {
            this.__scrollIntoViewIfNeeded();
        }
    },

    __applyClasses() {
        this.$el.toggleClass('layout__tab-layout__header-view-item_selected', Boolean(this.model.get('selected')));
        this.$el.toggleClass('layout__tab-layout__header-view-item_error', Boolean(this.model.get('error')));
        this.$el.toggleClass('layout__tab-layout__header-view-item_disabled', !this.model.get('enabled'));
        this.$el.toggleClass('layout__tab-layout__header-view-item_hidden', !this.model.isShow());
    },

    __onClick() {
        if (this.model.get('enabled')) {
            this.trigger('select', this.model);
        }
    },

    __onSelectedChange(model: Backbone.Model, selected: boolean) {
        if (selected) {
            this.__scrollIntoViewIfNeeded();
        }
    },

    // native scrollIntoView causing the whole page to move,
    // to prevent that behaviour we need to use scrollIntoViewOptions,
    // but Edge, IE, and Safari doesn't support scrollIntoViewOptions.
    __scrollIntoViewIfNeeded() {
        if (!this.__isUiReady() || this.__isIntoView()) {
            return;
        }
        const offsetLeft = this.el.offsetLeft;
        this.$el.offsetParent().animate({ scrollLeft: offsetLeft }, 300);
    },

    
    __isIntoView() {
        const parentScrollLeft = this.el.parentElement.scrollLeft;
        const parentOffsetWidth = this.el.parentElement.offsetWidth;
        const parentScrollRight = parentScrollLeft + parentOffsetWidth;

        const elOffsetLeft = this.el.offsetLeft;
        const elOffsetWidth = this.el.offsetWidth;
        const elOffsetRight = elOffsetLeft + elOffsetWidth;

        return elOffsetLeft > parentScrollLeft && elOffsetRight < parentScrollRight;
    },

    __isUiReady() {
        return this.isRendered() && !this.isDestroyed() && this.isAttached();
    }
});
