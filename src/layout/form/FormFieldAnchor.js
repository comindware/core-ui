/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';
import LayoutBehavior from '../behaviors/LayoutBehavior';

export default Marionette.ItemView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'key');
    },

    template: false,

    attributes() {
        return {
            'data-fields': this.options.key
        };
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onShow() {
        this.__updateState();
    },

    update() {
        this.__updateState();
    }
});
