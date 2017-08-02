/**
 * Developer: Stepan Burguchev
 * Date: 2/23/2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import helpers from '../helpers';

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(view, 'regions');
    },

    onBeforeRender() {
        this.regionManager = new Marionette.RegionManager();

        const view = this.view;
        const regions = _.isFunction(view.regions) ? view.regions.call(view) : view.regions || {};
        this.regionManager.addRegions(regions, {
            parentEl: () => this.$el
        });
        Object.assign(view, this.regionManager.getRegions());
    },

    onDestroy() {
        this.regionManager.destroy();
    }
});
