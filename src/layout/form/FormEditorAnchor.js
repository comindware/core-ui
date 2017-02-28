/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';

export default Marionette.ItemView.extend({
    initialize (options) {
        helpers.ensureOption(options, 'key');
    },

    template: false,

    attributes () {
        return {
            'data-editors': this.options.key
        };
    }
});
