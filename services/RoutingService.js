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

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer, Ajax */

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

        // storing active url to get back to it while canceling module leave
        var previousUrl;
        var activeUrl;
        var originalCheckUrl = Backbone.history.checkUrl;
        Backbone.history.checkUrl = function (e) {
            previousUrl = activeUrl;
            activeUrl = window.location.hash;
            originalCheckUrl.apply(this, arguments);
        };

        var configs = _.flatten([ moduleConfigs, projectModuleConfigs, processModuleConfigs ]);

        var activeModule = null;
        var loadingContext = null;
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
            loadingContext = {
                config: config,
                leavingPromise: null,
                loaded: false
            };
            if (!activeModule) {
                window.application.contentLoadingRegion.show(new ContentLoadingView());
            } else {
                loadingContext.leavingPromise = Promise.resolve(activeModule.leave());
                loadingContext.leavingPromise.then(function (canLeave) {
                    if (!canLeave) {
                        // getting back to last url
                        routingService.navigateToUrl(previousUrl, { replace: true, trigger: false });
                        return;
                    }
                    if (!loadingContext.loaded) {
                        activeModule.view.setModuleLoading(true);
                    }
                }.bind(this));
            }
        };

        var __onModuleLoaded = function (callbackName, routingArgs, config, Module) {
            // reject race condition
            if (loadingContext === null || loadingContext.config.module !== config.module) {
                return;
            }

            loadingContext.loaded = true;
            Promise.resolve(loadingContext.leavingPromise ? loadingContext.leavingPromise : true).then(function (canLeave) {
                if (!canLeave) {
                    return;
                }

                // reset loading region
                window.application.contentLoadingRegion.reset();
                if (activeModule) {
                    activeModule.view.setModuleLoading(false);
                }
                var movingOut = activeModule && activeModule.options.config.module !== config.module;

                // destroy active module
                if (activeModule && movingOut) {
                    activeModule.destroy();
                }

                // construct new module
                if (!activeModule || movingOut) {
                    activeModule = new Module({
                        config: config,
                        region: window.application.contentRegion
                    });
                }

                // navigate to new module
                loadingContext = null;
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
            }.bind(this));
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
                Backbone.history.checkUrl();
            },

            canNavigateBack: function () {
                return previousUrl !== undefined;
            },

            navigateBack: function () {
                Backbone.history.history.back();
            },

            // options: replace (history), trigger (routing)
            navigateToUrl: function (url, options) {
                options = options || {};
                if (options.trigger === undefined) {
                    options.trigger = true;
                }
                router.navigate(url, options);
            },

            logout: function () {
                //noinspection JSUnresolvedVariable
                Ajax.Home.Logout().then(function () {
                    window.location = "";
                });
            }
        };
        return routingService;
    });
