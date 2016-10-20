/**
 * Developer: Stepan Burguchev
 * Date: 11/18/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from '../../../../../libApi';
import template from '../templates/loading.hbs';

export default Marionette.ItemView.extend({
    initialize: function () {
    },

    className: 'l-loader',

    template: Handlebars.compile(template)
});
