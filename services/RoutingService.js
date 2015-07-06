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
        'core/utils/utilsApi',
        './routing/ModuleProxy',
        'core/application/views/ContentLoadingView',
        'module/moduleConfigs',
        'project/module/moduleConfigs',
        'process/module/moduleConfigs'
    ],
    function (lib, utilsApi, ModuleProxy, ContentLoadingView, moduleConfigs, projectModuleConfigs, processModuleConfigs) {
        'use strict';

        var configs = _.flatten([ moduleConfigs, projectModuleConfigs, processModuleConfigs ]);

        var activeModule = null;
        var thisOptions = null;
        var router;

        var __registerDefaultRoute = function () {
            var DefaultRouter = Marionette.AppRouter.extend({
                routes: {
                    "": "defaultRoute"
                },
                defaultRoute: function () {
                    routingService.navigateToUrl(thisOptions.defaultUrl, { replace: true });
                }
            });
            router = new DefaultRouter();
        };

        var __onModuleLoading = function (callbackName, routingArgs, config) {
            if (!activeModule) {
                window.application.contentLoadingRegion.show(new ContentLoadingView());
            } else {
                activeModule.view.setModuleLoading(true);
            }
        };

        var __onModuleLoaded = function (callbackName, routingArgs, config, Module) {
            // reset loading region
            window.application.contentLoadingRegion.reset();
            if (activeModule) {
                activeModule.view.setModuleLoading(false);
            }

            // destroy active module
            if (activeModule) {
                activeModule.destroy();
            }

            // construct new module
            activeModule = new Module({
                config: config
            });
            window.application.contentRegion.show(activeModule.view);

            // navigate to new module
            if (activeModule.onRoute) {
                activeModule.onRoute.apply(activeModule, routingArgs);
            }
            var routingCallback = activeModule[callbackName];
            if (!routingCallback) {
                var moduleId = config.id || config.module;
                utilsApi.helpers.throwError(
                    'Failed to find callback method `' + callbackName + '` for the module `' + moduleId + '`.');
            }
            routingCallback.apply(activeModule, routingArgs);
        };

        var routingService = {
            initialize: function (options) {
                utilsApi.helpers.ensureOption(options, 'defaultUrl');
                thisOptions = options;
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
            },

            // options: replace (history), trigger (routing)
            navigateToUrl: function (url, options) {
                options = options || {};
                if (options.trigger === undefined) {
                    options.trigger = true;
                }
                router.navigate(url, options);
            }
        };
        return routingService;
    });
