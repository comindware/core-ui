import CTEventsService from '../services/CTEventsService';
import WebSocketService from '../services/WebSocketService';
import RoutingService from '../services/RoutingService';
import ToastNotificationService from '../services/ToastNotificationService';
import PresenterService from '../services/PresenterService';
import Marionette from 'backbone.marionette';
import Backbone from 'backbone';

export default Marionette.Object.extend({
    constructor(options = {}) {
        Marionette.Object.prototype.constructor.apply(this, arguments);
        /*
        this.listenTo(CTEventsService, 'cbEvent', this.__handleEvent);
        if (WebSocketService.isConnected()) {
            this.listenTo(WebSocketService, 'ws:open ws:close ws:message ws:error', this.__handleSocketEvent);
        }
        */
        this.moduleId = options.config.id;
    },

    moduleRegion: window.contentRegion,

    leave(isCalledByUnloadEvent: boolean) {
        if (typeof this.onLeave === 'function') {
            const moduleLeaveConfig = this.onLeave();

            if (typeof moduleLeaveConfig === 'boolean') {
                return this.__checkPromisesAndLeave(moduleLeaveConfig);
            }

            if (isCalledByUnloadEvent) {
                return false;
            }

            return Core.services.MessageService.showSystemMessage(moduleLeaveConfig);
        }

        return this.__checkPromisesAndLeave(true);
    },

    setLoading(isLoading: boolean) {
        RoutingService.setModuleLoading(isLoading);
        if (isLoading === false) {
            this.__onModuleReady();
        }
    },

    contentViewOptions: null,

    triggerEvent(eventId, data) {
        CTEventsService.triggerStorageEvent(eventId, data);
    },

    sendWebSocketMessage(data) {
        WebSocketService.send(this.moduleId, data);
    },

    async handleRouterEvent(configuration, callParams) {
        const { view, viewModel, additionalViewOptions, errorView, viewEvents, routingAction, urlParams } = configuration;
        const methodParams = this.__applyCallParamsFilter(callParams, urlParams, routingAction);

        if (configuration.url) {
            const { data, error } = await this.__request(configuration, methodParams, callParams);
            if (error !== null) {
                if (errorView) {
                    const presentingView = new errorView();
                    if (viewEvents) {
                        Object.keys(viewEvents).forEach(key => this.listenTo(presentingView, key, viewEvents[key]));
                    }
                    this.moduleRegion.show(presentingView);
                }
            }
            if (viewModel) {
                const model = new viewModel(data, { parse: true });

                if (view) {
                    const viewParams = additionalViewOptions ? Object.assign({ model }, additionalViewOptions) : { model };

                    viewParams.viewState = this.currentState;

                    const presentingView = new view(viewParams);
                    if (viewEvents) {
                        Object.keys(viewEvents).forEach(key => this.listenTo(presentingView, key, viewEvents[key]));
                    }
                    presentingView.request = this.__handleViewResourceRequest.bind(this);
                    this.moduleRegion.show(presentingView);
                }
            }
        } else {
            const model = new viewModel();

            if (view) {
                const viewParams = additionalViewOptions ? Object.assign({ model }, additionalViewOptions) : { model };

                viewParams.currentState = callParams;
                const presentingView = new view(viewParams);
                if (viewEvents) {
                    Object.keys(viewEvents).forEach(key => this.listenTo(presentingView, key, viewEvents[key]));
                }
                presentingView.request = this.__handleViewResourceRequest.bind(this);
                this.moduleRegion.show(presentingView);
            }
        }
    },

    __checkPromisesAndLeave(canLeave) {
        if (Core.services.PromiseService.checkBeforeLeave()) {
            return Core.services.MessageService.showSystemMessage({
                type: Core.services.MessageService.systemMessagesTypes.unsavedChanges
            });
        }

        return canLeave;
    },

    __handleEvent(data) {
        if (this.eventsHandlers && this.eventsHandlers[data.id]) {
            this.eventsHandlers[data.id](data.data);
        }
    },

    __handleSocketEvent(data) {
        if (this.eventsHandlers && this.moduleId === data.id && this.eventsHandlers.onWebSocketMessage) {
            this.eventsHandlers.onWebSocketMessage.call(this, data.data);
        }
    },

    //todo extract view params and pass to failure
    async __request(configuration, methodParams, callParams) {
        const { notifications, onFailure, onSuccess } = configuration;
        const params = configuration.url.split('/');
        const showMask = configuration.showLoadingMask !== false;

        showMask && RoutingService.setModuleLoading(true);
        try {
            const requestFn = Ajax[params[0]][params[1]];
            if (requestFn) {
                const functionSignature = window.ajaxMap.find(requestTemplate => requestTemplate.className === params[0] && requestTemplate.methodName === params[1]);

                const requestType = functionSignature.httpMethod;
                const parameters = functionSignature.parameters;

                callParams && this.__applyState(callParams, parameters);

                const data = await requestFn.apply(this, methodParams);
                notifications && notifications.onSuccess && ToastNotificationService.add(notifications.onSuccess);
                onSuccess && onSuccess.call(this, data, methodParams);
                return { data, requestType, error: null };
            }
            throw new Error('Please, provide a valid URL');
        } catch (error) {
            notifications && notifications.onFailure && ToastNotificationService.add(notifications.onFailure);
            onFailure && onFailure.call(this, error);
            return { data: null, requestType: null, error };
        } finally {
            showMask && RoutingService.setModuleLoading(false);
        }
    },

    async __handleViewResourceRequest(requestId, requestData) {
        const requestConfig = this.requests[requestId];
        if (requestConfig) {
            const { data, requestType, error } = await this.__request(requestConfig, [requestData.data]);

            if (error === null) {
                switch (requestType) {
                    case 'POST':
                        if (requestData.model) {
                            if (requestData.model.model) {
                                const newModel = new requestData.model.model(Object.assign({ id: data }, requestData.data));
                                requestData.model.add(newModel, { remove: false });
                            }
                        }
                        break;
                    case 'DELETE': {
                        const callParamsDeletionItems = requestData.data;
                        if (requestData.model) {
                            requestData.model.remove(callParamsDeletionItems);
                        }
                        break;
                    }
                    case 'PUT': {
                        requestData.model && requestData.model.set(new Backbone.Model(requestData.data), { remove: false });
                        break;
                    }
                    case 'GET':
                        return data;
                    default:
                        break;
                }
            }
        }
        return null; //todo handle error
    },

    __applyState(callParams, parameters) {
        this.currentState = {};

        parameters.forEach((param, i) => (this.currentState[param.name] = callParams[i]));
    },

    __applyCallParamsFilter(callParams, urlParams, routingAction) {
        if (routingAction && urlParams) {
            const queryString = this.getOption('config').navigationUrl[routingAction];
            const params = queryString.split('/');
            const filteredParams = [];

            urlParams.forEach(param => params.indexOf(param) > -1 && filteredParams.push(callParams[params.indexOf(param) / 2]));

            return filteredParams;
        }

        return callParams;
    },

    __onModuleReady() {
        if (this.componentQuery) {
            PresenterService.presentComponentSequence(this.componentQuery);
        }
    }
});
