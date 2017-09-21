/**
 * Developer: Ksenia Kartvelishvili
 * Date: 21.04.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/bubble.html';

export default Marionette.ItemView.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            enabled: this.options.enabled,
            text: this.model.get(this.options.displayAttribute)
        };
    },

    tagName: 'li',

    className: 'bubbles__i btn-wrp dev-bubbles__i',

    events: {
        'click .js-bubble-delete': '__delete'
    },

    __delete(e) {
        e.stopPropagation();
        e.preventDefault();
        this.reqres.request('bubble:delete', this.model);
    }
});
