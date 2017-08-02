/**
 * Developer: Stepan Burguchev
 * Date: 11/17/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { $, Handlebars } from 'lib';
import { helpers } from 'utils';

export default Marionette.ItemView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'view');

        this.regionManager = new Marionette.RegionManager();
    },

    template: Handlebars.compile(''),

    onShow() {
        this.regionManager.addRegion('viewRegion', { el: this.$el });
        this.regionManager.get('viewRegion').show(this.options.view);
    },

    onDestroy() {
        this.regionManager.destroy();
    }
});
