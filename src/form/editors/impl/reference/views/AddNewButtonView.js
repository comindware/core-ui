/**
 * Developer: Denis Krasnovsky
 * Date: 18.01.2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

'use strict';

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from '../templates/addNewButton.hbs';
import list from 'list';

export default Marionette.ItemView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'reqres');
        this.reqres = options.reqres;
    },

    template: Handlebars.compile(template),

    events: {
        click: '__onClick'
    },

    className: 'reference-btn',

    __onClick() {
        this.reqres.request('add:new:item');
    }
});
