//@flow
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
        originalCheckUrl.apply(this);
    } else {
        shouldCheckUrl = true;
    }
};

export default {
    initialize(options) {
        Object.assign(this, Backbone.Events);
        this.loadersCount = 0;
        this.defaultUrl = options.defaultUrl;

        options.modules.forEach(config => {
            const controller = {};

            Object.values(config.routes).forEach(callbackName => {
                controller[callbackName] = (...theArgs) => {
                    this.__onModuleLoaded(callbackName, theArgs, config, config.module);
                };
            });

            new Marionette.AppRouter({
                controller,
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

        window.addEventListener('beforeunload', e => {
            const canLeave = this.activeModule ? this.activeModule.leave(true) : true;

            if (canLeave !== true) {
                const tabCloseLeavingMessage = this.activeModule.tabCloseLeavingMessage || 'Do you wanna leave?';

                (e || window.event).returnValue = tabCloseLeavingMessage;

                return tabCloseLeavingMessage;
            }
        });

        window.addEventListener('unload', () => {
            this.trigger('module:leave', {
                page: this.activeModule ? this.activeModule.moduleId : null,
                isUnload: true
            });
        });
    },

    changeSplitViewLayout(newLayoutType) {
        this.activeModule?.currentView?.toggleOrientation?.(newLayoutType);
    },

    canNavigateBack() {
        return previousUrl !== undefined;
    },

    navigateBack() {
        Backbone.history.history.back();
    },

    // options: replace (history), trigger (routing), split (show in split)
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

    setModuleLoading(show, { message, useForce = false } = {}) {
        show ? this.__showViewPlaceholder(message) : this.__hideViewPlaceholder(useForce);
    },

    async __onModuleLoaded(callbackName, routingArgs, config, Module) {
        const subModuleContext = this.__tryGetSubmoduleContext(config);

        const context = subModuleContext || this;

        const isLeaved = await this.__tryLeaveModuleAndCheckRaceCondition({ context, config });
        if (!isLeaved) {
            return false;
        }

        this.setModuleLoading(true);

        if (!subModuleContext && context.activeModule) {
            //do not trigger events and cancel requests for submodules
            this.trigger('module:leave', {
                page: this.activeModule ? this.activeModule.moduleId : null,
                activeUrl,
                previousUrl
            });
            //clear all promises of the previous module
            Core.services.PromiseService.cancelAll();
        }

        let componentQuery;

        const lastArg = _.last(_.compact(routingArgs));
        const index = routingArgs.indexOf(lastArg);

        if (lastArg) {
            componentQuery = lastArg.split('@');

            if (componentQuery && componentQuery.length > 1) {
                routingArgs[index] = componentQuery[0];
            }
        }
        WindowService.closeAllPopups();

        const movingOut = this.__destroyPreviousModuleIfMovingOut({ context, config });

        await this.__initializeModuleIfNeeded({ context, movingOut, config, Module });

        this.trigger('module:loaded', config, callbackName, routingArgs); //args like in Backbone.on('route')


        context.loadingContext = null;

        const continueHandling = await this.__callOnRoute({ context, routingArgs, callbackName });
        if (continueHandling === false) {
            return;
        }

        // if onModuleLoaded not apply any await, then url has no changes, therefore we need setTimeout.
        await new Promise(resolve => setTimeout(resolve));

        const isFindCallback = this.__callRoutingActionForModule(callbackName, routingArgs, context.activeModule);

        if (isFindCallback === false) {
            this.setModuleLoading(false, { useForce: true });
        }

        this.__setupComponentQuery(componentQuery);
        this.setModuleLoading(false);
    },

    async __tryLeaveModuleAndCheckRaceCondition({ context = this, config }) {
        context.loadingContext = { config };
        const isLeaved = await this.__tryLeaveModule(context.activeModule);
        if (!isLeaved) {
            return false;
        }

        // reject race condition
        if (context.loadingContext === null || context.loadingContext.config.module !== config.module) {
            return false;
        }

        return true;
    },

    __destroyPreviousModuleIfMovingOut({ context = this, config }) {
        const loadedModule = context.activeModule;
        const movingOut = loadedModule && loadedModule.options.config.module !== config.module;
        if (loadedModule && movingOut) {
            loadedModule.destroy();
        }
        return movingOut;
    },

    async __initializeModuleIfNeeded({ context = this, movingOut, config, Module }) {
        if (!context.activeModule || movingOut) {
            context.activeModule = await new Module({
                config,
                // custom region for submodules
                region: context !== this ? context.region : window.app.getView().getRegion('contentRegion')
            });

            /*
            activeSubModule.on('all', (...rest) => this.activeModule.triggerMethod(...rest));
            */
        }
    },

    async __callOnRoute({ context, routingArgs, callbackName }) {
        const activeModule = context.activeModule;
        if (activeModule && activeModule.onRoute) {
            activeModule.routerAction = callbackName;
            const continueHandling = await activeModule.onRoute.apply(activeModule, routingArgs);
            return continueHandling;
        }
    },

    __showViewPlaceholder(message) {
        this.loadersCount++;
        window.contentLoadingRegion.el.classList.add('visible-loader');
        window.contentLoadingRegion.currentView.setLoadingMessage(message);
    },

    __hideViewPlaceholder(useForce) {
        this.loadersCount--;
        if (this.loadersCount <= 0 || useForce) {
            window.contentLoadingRegion.el.classList.remove('visible-loader');
        }
        if (this.loadersCount < 0 || useForce) {
            this.loadersCount = 0;
        }
    },

    async __tryLeaveModule(module) {
        if (!module) {
            return true;
        }
        const canLeave = await module.leave();

        if (!canLeave && this.getPreviousUrl()) {
            // getting back to last url
            this.navigateToUrl(this.getPreviousUrl(), { replace: true, trigger: false });
            return false;
        }

        return true;
    },

    __tryGetSubmoduleContext(config) {
        if (this.activeModule && this.activeModule.moduleRegion.currentView && window.location.hash.startsWith('#split')) {
            const map = this.activeModule.moduleRegion.currentView.regionModulesMap;

            if (map) {
                const match = map.find(pair => Object.values(config.navigationUrl).some(url => RegExp(pair.routeRegExp).test(url)));
                if (match) {
                    return match;
                }
            }
        }

        return null;
    },

    __callRoutingActionForModule(callbackName, routingArgs, module) {
        if (module.routingActions && module.routingActions[callbackName]) {
            let configuration = module.routingActions[callbackName];
            if (typeof configuration === 'function') {
                configuration = configuration.bind(module);
            }

            configuration.routingAction = callbackName;

            module.handleRouterEvent.call(module, configuration, routingArgs);
        } else {
            const routingCallback = module[callbackName];

            if (!routingCallback) {
                Core.InterfaceError.logError(`Can not find routing callback "${callbackName}" for module "${module.moduleId}"`);
                return false;
            }
            routingCallback.apply(module, routingArgs);
        }
    },

    __setupComponentQuery(componentQuery) {
        if (componentQuery && componentQuery.length > 1) {
            this.activeModule.componentQuery = componentQuery[1];
        } else {
            this.activeModule.componentQuery = null;
        }
    }
};
