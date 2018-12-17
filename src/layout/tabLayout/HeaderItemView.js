// @flow
import template from './templates/headerItem.hbs';

export default Marionette.View.extend({
    tagName: 'li',

    className() {
        return `layout__tab-layout__header-view-item ${this.model.get('tabClass') || ''}`;
    },

    attributes() {
        return Object.assign({}, this.model?.get('description') ? { title: this.model.get('description') } : {});
    },

    template: Handlebars.compile(template),

    events: {
        click: '__onClick'
    },

    modelEvents: {
        'change:selected change:error change:enabled change:visible': 'render'
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
    }
});
