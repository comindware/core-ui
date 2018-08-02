import ContentLoadingView from './routing/ContentLoadingView';
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
        Object.assign(this, Backbone.Events);
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
            this.trigger('module:leave', {
                page: this.activeModule ? this.activeModule.moduleId : null
            });
            const canLeave = this.activeModule ? this.activeModule.leave(true) : true;

            if (canLeave !== true) {
                // We need just to return smth to show default drowser leaving alert
                (e || window.event).returnValue = '42';
                return '42';
            }
        });
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

    async __onModuleLoaded(callbackName, routingArgs, config, Module) {
        WindowService.closePopup();
        this.loadingContext = {
            config,
            leavingPromise: null,
            loaded: false
        };
        if (!this.activeModule) {
            window.app
                .getView()
                .getRegion('contentLoadingRegion')
                .show(new ContentLoadingView());
        } else {
            this.trigger('module:before:leave', {
                page: this.activeModule ? this.activeModule.moduleId : null
            });
            const canLeave = await this.activeModule.leave();
            if (!canLeave && this.getPreviousUrl()) {
                // getting back to last url
                this.navigateToUrl(this.getPreviousUrl(), { replace: true, trigger: false });
                return;
            }
            this.trigger('module:leave', {
                page: this.activeModule ? this.activeModule.moduleId : null
            });
            //clear all promises of the previous module
            Core.services.PromiseService.cancelAll();
            if (!this.loadingContext.loaded) {
                this.activeModule.view.setModuleLoading(true);
            }
        }

        // reject race condition
        if (this.loadingContext === null || this.loadingContext.config.module !== config.module) {
            return;
        }

        this.loadingContext.loaded = true;
        // reset loading region
        window.app
            .getView()
            .getRegion('contentLoadingRegion')
            .reset();
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
                region: window.app.getView().getRegion('contentRegion')
            });
        }
        this.trigger('module:loaded', {
            page: this.activeModule ? this.activeModule.moduleId : null
        });

        let componentQuery;
        const lastArg = _.last(_.compact(routingArgs));
        const index = routingArgs.indexOf(lastArg);

        if (lastArg) {
            componentQuery = lastArg.split('@');

            if (componentQuery && componentQuery.length > 1) {
                routingArgs[index] = componentQuery[0];
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

        if (componentQuery && componentQuery.length > 1) {
            this.activeModule.componentQuery = componentQuery[1];
        } else {
            this.activeModule.componentQuery = null;
        }
    }
};
