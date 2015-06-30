/**
 * Developer: Stepan Burguchev
 * Date: 6/26/2015
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
        './routing/ModuleProxy',
        'module/moduleConfigs',
        'project/module/moduleConfigs',
        'process/module/moduleConfigs'
    ],
    function (lib, ModuleProxy, moduleConfigs, projectModuleConfigs, processModuleConfigs) {
        'use strict';

        var application = window.application;

        var configs = _.flatten([ moduleConfigs, projectModuleConfigs, processModuleConfigs ]);

        var activeModule = null;

        var __onModuleLoading = function () {
            // set loading region
        };

        var __onModuleLoaded = function () {
            // reset loading region
            // destroy active module
            // construct new module
            // navigate to new module
        };

        return {
            initialize: function () {
                _.each(configs, function (config) {
                    var moduleProxy = new ModuleProxy({
                        config: config
                    });
                    this.on(moduleProxy, 'module:loading', __onModuleLoading);
                    this.on(moduleProxy, 'module:loaded', __onModuleLoaded);
                    new Marionette.AppRouter({
                        controller: moduleProxy,
                        appRoutes: config.routes
                    });
                }, this);

                // Then we start loading default module (after that we can start history)
                this.__navigateToDefaultModule();
                Backbone.history.start();
            }
        };
    });
