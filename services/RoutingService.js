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
        'core/application/views/ModuleLoadingView',
        'module/moduleConfigs',
        'project/module/moduleConfigs',
        'process/module/moduleConfigs'
    ],
    function (lib, ModuleProxy, ModuleLoadingView, moduleConfigs, projectModuleConfigs, processModuleConfigs) {
        'use strict';

        var application = window.application;

        var configs = _.flatten([ moduleConfigs, projectModuleConfigs, processModuleConfigs ]);

        var activeModule = null;

        var __registerDefaultRoute = function () {
            var DefaultRouter = Marionette.AppRouter.extend({
                controller: moduleProxy,
                appRoutes: config.routes,
                routes: {
                    "": "index"
                }
            });
            new DefaultRouter();
        };

        var __onModuleLoading = function (callbackName, routingArgs, config) {
            // set loading region
            application.moduleLoadingRegion.show(new ModuleLoadingView());
        };

        var __onModuleLoaded = function (callbackName, routingArgs, config, Module) {
            // reset loading region
            application.moduleLoadingRegion.reset();

            // destroy active module
            if (activeModule) {
                activeModule.destroy();
            }

            // construct new module
            activeModule = new Module({
                config: config,
                contentRegion: application.moduleRegion
            });

            // navigate to new module
            activeModule[callbackName].apply(activeModule, routingArgs);
        };

        return {
            initialize: function () {
                _.each(configs, function (config) {
                    var moduleProxy = new ModuleProxy({
                        config: config
                    });
                    moduleProxy.on('module:loading', __onModuleLoading);
                    moduleProxy.on('module:loaded', __onModuleLoaded);
                    new Marionette.AppRouter({
                        controller: moduleProxy,
                        appRoutes: config.routes
                    });
                }, this);

                __registerDefaultRoute();
                Backbone.history.start();
            }
        };
    });
