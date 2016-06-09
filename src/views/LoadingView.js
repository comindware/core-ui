/**
 * Developer: Ksenia Kartvelishvili
 * Date: 29.06.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import template from '../templates/loading.hbs';

export default Marionette.ItemView.extend({
    templateHelpers: function () {
        return {
            text: this.options.text
        };
    },

    template: template,

    className: 'l-loader'
});
