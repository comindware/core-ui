/**
 * Developer: Stepan Burguchev
 * Date: 7/17/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';

const windowEventList = [
    {
        name: 'click',
        capture: true
    },
    {
        name: 'keydown',
        capture: true
    },
    {
        name: 'mousedown',
        capture: true
    },
    {
        name: 'mouseup',
        capture: true
    },
    {
        name: 'wheel',
        capture: true
    },
    {
        name: 'resize',
        capture: false
    }
];

var globalEventService = /** @lends module:core.services.GlobalEventService */ {
    initialize: function () {
        this.__windowEvents = windowEventList.map(x => {
            let captureSuffix = x.capture ? ':captured' : '';
            let eventName = `window:${x.name}${captureSuffix}`;
            return {
                name: x.name,
                capture: x.capture,
                handler: e => {
                    this.trigger(eventName, e.target, e);
                }
            };
        });
        this.__windowEvents.forEach(x => {
            window.addEventListener(x.name, x.handler, x.capture);
        });
    },

    onDestroy: function () {
        this.__windowEvents.forEach(x => {
            window.removeEventListener(x.name, x.handler, x.capture);
        });
    }
};

_.extend(globalEventService, Backbone.Events);

export default globalEventService;
