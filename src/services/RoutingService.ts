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
    }
    shouldCheckUrl = true;
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

    canNavigateBack() {
        return previousUrl !== undefined;
    },

    navigateBack() {
        Backbone.history.history.back();
    },

    // options: replace (history), trigger (routing), split (show in split)
    navigateToUrl(url, options = {}) {
        let newUrl = url;

        if (options.trigger === undefined) {
            options.trigger = true;
        }

        shouldCheckUrl = options.trigger || activeUrl === url;

        if (options.split) {
            newUrl = this.__getSplitModuleUrl(url);
        }
        if (!shouldCheckUrl) {
            if (!options.split) {
                newUrl = this.__getUpdatedUrl(url);
            }

            if (url !== newUrl) {
                shouldCheckUrl = true;
            }
        }

        Backbone.history.navigate(newUrl, options);
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

    getRoutHandlers(url = '') {
        const urlParts = url.split('&nxt').splice(1);
        const matchingUrls = [];

        return (Backbone.history.handlers.filter(handler => urlParts.some(part => handler.route.test(part) && matchingUrls.push(part))) || []).map((h, i) => ({
            callback: h.callback,
            route: matchingUrls[i],
            routeRegExp: h.route
        }));
    },

    isCurrentModuleSplit() {
        return activeUrl?.startsWith('#custom');
    },

    setModuleLoading(show, useForce) {
        show ? this.__showViewPlaceholder() : this.__hideViewPlaceholder(useForce);
    },

    async __onModuleLoaded(callbackName, routingArgs, config, Module) {
        WindowService.closePopup();
        this.loadingContext = {
            config,
            leavingPromise: null,
            loaded: false
        };

        const customModuleRegion = this.__tryGetSubmoduleRegion(config);

        if (this.activeModule && !customModuleRegion) {
            const isLeaved = await this.__tryLeaveActiveModule(!!customModuleRegion);
            if (!isLeaved) {
                return;
            }
        }

        // reject race condition
        if (this.loadingContext === null || this.loadingContext.config.module !== config.module) {
            return;
        }

        this.loadingContext.loaded = true;

        const movingOut = this.activeModule && this.activeModule.options.config.module !== config.module;

        let componentQuery;

        const lastArg = _.last(_.compact(routingArgs));
        const index = routingArgs.indexOf(lastArg);

        if (lastArg) {
            componentQuery = lastArg.split('@');

            if (componentQuery && componentQuery.length > 1) {
                routingArgs[index] = componentQuery[0];
            }
        }

        if (this.activeModule && movingOut && !customModuleRegion) {
            this.activeModule.destroy();
        }
        this.setModuleLoading(true);

        let activeSubModule = null;

        if (!this.activeModule || movingOut || customModuleRegion) {
            if (customModuleRegion) {
                activeSubModule = new Module({
                    config,
                    region: customModuleRegion
                });
                this.listenTo(activeSubModule, 'all', (...rest) => this.activeModule.trigger(...rest));
            } else {
                this.activeModule = new Module({
                    config,
                    region: window.app.getView().getRegion('contentRegion')
                });
            }
        }
        this.trigger('module:loaded', config, callbackName, routingArgs); //args like in Backbone.on('route')

        if (activeSubModule) {
            if (activeSubModule.onRoute) {
                activeSubModule.routerAction = callbackName;
                await activeSubModule.onRoute.apply(activeSubModule, routingArgs);
            }
        }

        // navigate to new module
        this.loadingContext = null;
        if (this.activeModule.onRoute) {
            this.activeModule.routerAction = callbackName;
            const continueHandling = await this.activeModule.onRoute.apply(this.activeModule, routingArgs);
            if (continueHandling === false) {
                return;
            }
        }

        if (!this.isCurrentModuleSplit() || activeSubModule) {
            try {
                if (activeSubModule) {
                    this.__callRoutingActionForActiveSubModule(callbackName, routingArgs, activeSubModule);
                } else {
                    this.__callRoutingActionForActiveModule(callbackName, routingArgs);
                }
            } catch (e) {
                this.setModuleLoading(false, true);
                Core.utils.helpers.throwError(e);
            }
        } else if (this.isCurrentModuleSplit() && !this.activeModule.moduleRegion.currentView) {
            this.__callRoutingActionForActiveModule(callbackName, routingArgs);
        } else {
            this.__invalidateSubModules(this.activeModule.moduleRegion.currentView.regionModulesMap);
        }

        this.__setupComponentQuery(componentQuery);
        this.setModuleLoading(false);
    },

    __showViewPlaceholder() {
        this.loadersCount++;
        window.contentLoadingRegion.$el.addClass('visible-loader');
    },

    __hideViewPlaceholder(useForce) {
        this.loadersCount--;
        if (this.loadersCount <= 0 || useForce) {
            window.contentLoadingRegion.$el.removeClass('visible-loader');
        }
        if (this.loadersCount < 0 || useForce) {
            this.loadersCount = 0;
        }
    },

    async __tryLeaveActiveModule() {
        const canLeave = await this.activeModule.leave();

        if (!canLeave && this.getPreviousUrl()) {
            // getting back to last url
            this.navigateToUrl(this.getPreviousUrl(), { replace: true, trigger: false });
            return false;
        }

        //do not trigger events and cancel requests for submodules
        this.trigger('module:leave', {
            page: this.activeModule ? this.activeModule.moduleId : null,
            activeUrl,
            previousUrl
        });
        //clear all promises of the previous module
        Core.services.PromiseService.cancelAll();
        if (!this.loadingContext.loaded) {
            this.setModuleLoading(false);
        }
        return true;
    },

    __tryGetSubmoduleRegion(config) {
        if (this.activeModule && this.activeModule.moduleRegion.currentView && window.location.hash.startsWith('#custom')) {
            const map = this.activeModule.moduleRegion.currentView.regionModulesMap;

            if (map) {
                const match = map.find(pair => Object.values(config.navigationUrl).some(url => RegExp(pair.routeRegExp).test(url)));
                if (match) {
                    return match.region;
                }
            }
        }

        return null;
    },

    __callRoutingActionForActiveSubModule(callbackName, routingArgs, activeSubModule) {
        if (activeSubModule.routingActions && activeSubModule.routingActions[callbackName]) {
            const configuration = activeSubModule.routingActions[callbackName].bind(activeSubModule);

            configuration.routingAction = callbackName;

            activeSubModule.handleRouterEvent.call(activeSubModule, configuration, routingArgs);
        } else {
            const routingCallback = activeSubModule[callbackName];

            if (!routingCallback) {
                throw new Error();
            }
            routingCallback.apply(activeSubModule, routingArgs);
        }
    },

    __callRoutingActionForActiveModule(callbackName, routingArgs) {
        if (this.activeModule.routingActions && this.activeModule.routingActions[callbackName]) {
            const configuration = this.activeModule.routingActions[callbackName];

            configuration.routingAction = callbackName;

            this.activeModule.handleRouterEvent.call(this.activeModule, configuration, routingArgs);
        } else {
            const routingCallback = this.activeModule[callbackName];

            if (!routingCallback) {
                throw new Error();
            }
            routingCallback.apply(this.activeModule, routingArgs);
        }
    },

    __setupComponentQuery(componentQuery) {
        if (componentQuery && componentQuery.length > 1) {
            this.activeModule.componentQuery = componentQuery[1];
        } else {
            this.activeModule.componentQuery = null;
        }
    },

    __invalidateSubModules(regionModulesMap) {
        regionModulesMap.forEach(module => {
            const cleanUrl = module.pair.route.replace('#', '');
            const prefix = cleanUrl.split('/')[0];
            const urlParts = activeUrl.split('&nxt');
            const replaceIndex = urlParts.findIndex(part => part.includes(prefix));
            const newRoute = window.location.hash.replace('#', '').split('&nxt')[replaceIndex];

            if (replaceIndex !== -1 && urlParts[replaceIndex] !== newRoute) {
                module.pair.route = newRoute;
                setTimeout(() => module.pair.callback(module.pair.route));
            }
        });
    },

    __getSplitModuleUrl(nextModuleUrl) {
        if (this.isCurrentModuleSplit()) {
            return this.__getUpdatedUrl(nextModuleUrl);
        }

        return `#custom/&nxt${window.location.hash.replace('#', '')}&nxt${nextModuleUrl.replace('#', '')}`;
    },

    __getUpdatedUrl(url = '') {
        const cleanUrl = url.replace('#', '');
        const prefix = cleanUrl.split('/')[0];
        const urlParts = window.location.hash.split('&nxt');
        const replaceIndex = urlParts.findIndex(part => part.includes(prefix));

        if (replaceIndex !== -1 && urlParts.some(part => part.startsWith('#custom'))) {
            urlParts.splice(replaceIndex, 1, cleanUrl);

            return urlParts.join('&nxt');
        }

        return url;
    }
};
