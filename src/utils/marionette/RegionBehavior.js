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
    initialize (options, view) {
        helpers.ensureOption(view, 'regions');

        this.regionManager = new Marionette.RegionManager();
        this.regionManager.addRegions(view.regions, {
            parentEl: () => this.$el
        });
        Object.assign(view, this.regionManager.getRegions());
    },

    onDestroy () {
        this.regionManager.destroy();
    }
});
