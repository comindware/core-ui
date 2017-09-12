/**
 * Developer: Ksenia Kartvelishvili
 * Date: 8/31/2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/referenceBubblePanelTitleItem.hbs';

export default Marionette.ItemView.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },
    template: Handlebars.compile(template),

    templateHelpers() {
        debugger;
        return {
            text: this.options.getDisplayText(this.model.get('value'))
        };
    },
    
    ui: {
        clear: '.js-clear'
    },
    
    events: {
        'click @ui.clear': '__clear'
    },

    __clear() {
        this.reqres.request('item:add', this.model);
    }
});
