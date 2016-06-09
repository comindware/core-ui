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

"use strict";

import '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import template from '../templates/addNewButton.hbs';
import list from '../../../../../list/listApi';

export default Marionette.ItemView.extend({
    initialize: function(options) {
        helpers.ensureOption(options, 'reqres');
        this.reqres = options.reqres;
    },

    template: template,

    events:{
        'click': '__onClick'
    },

    className: 'add-new-reference-button',

    __onClick: function() {
        this.reqres.request('add:new:item');
    }
});
