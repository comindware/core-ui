/**
 * Developer: Grigory Kuznetsov
 * Date: 18.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';

export default {
    getFilterViewByType() {
        return Marionette.View.extend({
            template: Handlebars.compile('<div class="innerDiv">PopoutView</div>'),
            className: 'native-filter-popout'
        });
    }
};
