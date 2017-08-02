/**
 * Developer: Ksenia Kartvelishvili
 * Date: 29.06.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/loading.hbs';

export default Marionette.ItemView.extend({
    templateHelpers() {
        return {
            text: this.options.text
        };
    },

    template: Handlebars.compile(template),

    className: 'l-loader'
});
