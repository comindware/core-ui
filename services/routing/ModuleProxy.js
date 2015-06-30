/**
 * Developer: Stepan Burguchev
 * Date: 6/30/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        'module/lib',
        'core/utils/utilsApi'
    ],
    function (lib, utilsApi) {
        'use strict';

        return Marionette.Controller.extend({
            initialize: function (options) {
                utilsApi.helpers.ensureOption(options, 'config');

                _.bindAll(this, '__callbackProxy');
                _.each(options.config, function (callbackName) {
                    this[callbackName] = this.__callbackProxy;
                }, this);
            },

            __callbackProxy: function () {
                this.trigger('module:loading', this.options.config);
                this.__loadModule().then(function (Module) {
                    this.trigger('module:loaded', this.options.config, Module);
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
    });
