/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import template from './headerItem.hbs';

export default Marionette.ItemView.extend({
    tagName: 'li',

    className: 'layout__tab-layout__header-view-item',

    template: Handlebars.compile(template),

    events: {
        click: '__onClick'
    },

    modelEvents: {
        'change:selected change:error change:enabled'() {
            this.render();
        }
    },

    onRender() {
        this.$el.toggleClass('layout__tab-layout__header-view-item_selected', Boolean(this.model.get('selected')));
        this.$el.toggleClass('layout__tab-layout__header-view-item_error', Boolean(this.model.get('error')));
        this.$el.toggleClass('layout__tab-layout__header-view-item_disabled', !this.model.get('enabled'));
    },

    __onClick() {
        if (this.model.get('enabled')) {
            this.trigger('select');
        }
    }
});
