import template from '../templates/iconItemCategory.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    ui: {
        itemPalette: '.js-item-palette',
        iconItem: '.js-icon-item'
    },

    events: {
        'click .js-icon-item': '__onItemClick'
    },

    className: 'icons-panel-category',

    __onItemClick(data) {
        const id = $(data.target).data('id') || $(data.target.parentElement).data('id');
        this.trigger('click:item', id);
    }
});
