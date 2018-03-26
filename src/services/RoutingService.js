/**
 * Developer: Stepan Burguchev
 * Date: 8/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import ContentLoadingView from './routing/ContentLoadingView';
import ModuleProxy from './routing/ModuleProxy';
import WindowService from './WindowService';

// storing active url to get back to it while canceling module leave
let previousUrl;
let activeUrl;
let shouldCheckUrl = true;

const originalCheckUrl = Backbone.history.checkUrl;
Backbone.history.checkUrl = () => {
    previousUrl = activeUrl;
    activeUrl = window.location.hash;

    if (shouldCheckUrl) {
        originalCheckUrl.apply(this, arguments);
    }
    shouldCheckUrl = true;
};

export default {
    initialize(options) {
        this.defaultUrl = options.defaultUrl;
        options.modules.forEach(config => {
            const moduleProxy = new ModuleProxy({ config });
            moduleProxy.on('module:loaded', this.__onModuleLoaded, this);
            new Marionette.AppRouter({
                controller: moduleProxy,
                appRoutes: config.routes
            });
        });

        new (Marionette.AppRouter.extend({
            routes: {
                '': 'defaultRoute'
            },
            defaultRoute: () => this.navigateToUrl(this.defaultUrl, { replace: true })
        }))();

        Backbone.history.start();
        Backbone.history.checkUrl();
    },

    canNavigateBack() {
        return previousUrl !== undefined;
    },

    navigateBack() {
        Backbone.history.history.back();
    },

    // options: replace (history), trigger (routing)
    navigateToUrl(url, options = {}) {
        if (options.trigger === undefined) {
            options.trigger = true;
        }
        shouldCheckUrl = options.trigger || activeUrl === url;
        Backbone.history.navigate(url, options);
    },

    getPreviousUrl() {
        return previousUrl;
    },

    refresh() {
        Backbone.history.fragment = null;
        this.navigateToUrl(activeUrl);
    },

    setDefaultUrl(newDefaultUrl) {
        this.defaultUrl = newDefaultUrl;
    },

    __onModuleLoaded(callbackName, routingArgs, config, Module) {
        WindowService.closePopup();
        this.loadingContext = {
            config,
            leavingPromise: null,
            loaded: false
        };
        if (!this.activeModule) {
            window.application.contentLoadingRegion.show(new ContentLoadingView());
        } else {
            this.loadingContext.leavingPromise = Promise.resolve(this.activeModule.leave());
            this.loadingContext.leavingPromise.then(canLeave => {
                if (!canLeave && this.getPreviousUrl()) {
                    // getting back to last url
                    this.navigateToUrl(this.getPreviousUrl(), { replace: true, trigger: false });
                    return;
                }
                //clear all promises of the previous module
                Core.services.PromiseService.cancelAll();
                if (!this.loadingContext.loaded) {
                    this.activeModule.view.setModuleLoading(true);
                }
            });
        }

        // reject race condition
        if (this.loadingContext === null || this.loadingContext.config.module !== config.module) {
            return;
        }

        this.loadingContext.loaded = true;
        Promise.resolve(this.loadingContext.leavingPromise ? this.loadingContext.leavingPromise : true).then(canLeave => {
            if (!canLeave) {
                return;
            }

            // reset loading region
            window.application.contentLoadingRegion.reset();
            if (this.activeModule) {
                this.activeModule.view.setModuleLoading(false);
            }
            const movingOut = this.activeModule && this.activeModule.options.config.module !== config.module;

            // destroy active module
            if (this.activeModule && movingOut) {
                this.activeModule.destroy();
            }

            // construct new module
            if (!this.activeModule || movingOut) {
                this.activeModule = new Module({
                    config,
                    region: window.application.contentRegion
                });
            }

            // navigate to new module
            this.loadingContext = null;
            if (this.activeModule.onRoute) {
                this.activeModule.routerAction = callbackName;
                const continueHandling = this.activeModule.onRoute.apply(this.activeModule, routingArgs);
                if (continueHandling === false) {
                    return;
                }
            }
            if (this.activeModule.routingActions && this.activeModule.routingActions[callbackName]) {
                const configuration = this.activeModule.routingActions[callbackName];
                configuration.routingAction = callbackName;
                this.activeModule.handleRouterEvent.call(this.activeModule, configuration, routingArgs);
            } else {
                const routingCallback = this.activeModule[callbackName];
                if (!routingCallback) {
                    Core.utils.helpers.throwError(`Failed to find callback method \`${callbackName}\` for the module \`${config.id}` || `${config.module}\`.`);
                }
                routingCallback.apply(this.activeModule, routingArgs);
            }
        });
    }
};
