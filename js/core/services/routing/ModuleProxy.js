/**
 * Developer: Stepan Burguchev
 * Date: 6/30/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import { helpers } from '../../utils/utilsApi';

export default Marionette.Controller.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'config');

        _.bindAll(this, '__callbackProxy');
        _.each(options.config.routes, function (callbackName) {
            this[callbackName] = function () {
                this.__callbackProxy(callbackName, _.toArray(arguments));
            };
        }, this);
    },

    __callbackProxy: function (callbackName, routingArgs) {
        this.trigger('module:loading', callbackName, routingArgs, this.options.config);
        this.__loadModule().then(function (Module) {
            this.trigger('module:loaded', callbackName, routingArgs, this.options.config, Module);
        }.bind(this));
    },

    __loadModule: function () {
        var path = this.options.config.module;
        return new Promise(function (resolve) {
            require([ path ], function (Module) {
                resolve(Module);
            });
        });
    }
});
