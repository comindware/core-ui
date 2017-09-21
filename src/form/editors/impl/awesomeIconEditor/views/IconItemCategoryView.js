/**
 * Developer: Zaycev Ivan
 * Date: 29.06.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

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
