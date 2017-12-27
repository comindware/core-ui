/**
 * Developer: Stepan Burguchev
 * Date: 6/30/2015
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

export default Marionette.Object.extend({
    initialize(options) {
        Object.values(options.config.routes).forEach(callbackName => {
            // eslint-disable-next-line func-names
            this[callbackName] = function() {
                this.trigger('module:loaded', callbackName, Array.from(arguments), this.options.config, this.options.config.module);
            };
        });
    }
});
