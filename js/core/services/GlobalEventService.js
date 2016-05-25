/**
 * Developer: Stepan Burguchev
 * Date: 7/17/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';

let $window = $(window);

let GlobalEventsService = Marionette.Object.extend({
    initialize: function () {
        _.bindAll(this, '__onResize', '__onWindowClickCaptured');

        $window.on('resize', this.__onResize);
        window.addEventListener('click', this.__onWindowClickCaptured, true);
    },

    onDestroy: function () {
        $window.off('resize');
        window.removeEventListener('click', this.__onWindowClickCaptured, true);
    },

    __onWindowClickCaptured: function (e) {
        this.trigger('windowClickCaptured', e.target, e);
    },

    __onResize: function (e) {
        this.trigger('resize', e);
    }
});

export default new GlobalEventsService();
