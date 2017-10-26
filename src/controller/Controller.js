/**
 * Developer: Vladislav Smirnov
 * Date: 10.9.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import CTEventsService from '../services/CTEventsService';
import WebSocketService from '../services/WebSocketService';
import ToastNotificationService from '../services/ToastNotificationService';

export default Marionette.Object.extend({
    constructor(options = {}) {
        const contentViewOptions = _.result(this, 'contentViewOptions') || {};
        this.contentView = this.contentView || window.application.defaultContentView;
        this.view = new this.contentView(contentViewOptions);
        this.moduleRegion = this.view.moduleRegion;
        options.region.show(this.view); // <- this can be moved out to routing services after we get rid of old modules
        Marionette.Object.prototype.constructor.apply(this, arguments);
        this.listenTo(CTEventsService, 'cbEvent', this.__handleEvent);
        if (WebSocketService.isConnected()) {
            this.listenTo(WebSocketService, 'ws:open ws:close ws:message ws:error', this.__handleSocketEvent);
        }
        this.moduleId = options.config.id;
    },

    leave() {
        if (_.isFunction(this.onLeave)) {
            return this.onLeave();
        }
        return Promise.resolve(true);
    },

    setLoading(isLoading) {
        this.view.setModuleLoading(isLoading);
    },

    contentViewOptions: null,

    triggerEvent(eventId, data) {
        CTEventsService.triggerStorageEvent(eventId, data);
    },

    sendWebSocketMessage(data) {
        WebSocketService.send(this.moduleId, data);
    },

    async handleRouterEvent(configuration, callParams) {
        const { data, error } = await this.__request(configuration, callParams);
        if (error !== null) {
            if (configuration.errorView) {
                const view = new configuration.errorView();
                if (configuration.viewEvents) {
                    Object.keys(configuration.viewEvents).forEach(key => this.listenTo(view, key, configuration.viewEvents[key]));
                }
                this.moduleRegion.show(view);
            }
        }
        if (configuration.viewModel) {
            const viewModel = new configuration.viewModel(data, { parse: true });

            if (configuration.view) {
                const viewParams = configuration.additionalViewOptions
                    ? Object.assign({ model: viewModel }, configuration.additionalViewOptions)
                    : { model: viewModel };

                const view = new configuration.view(viewParams);
                if (configuration.viewEvents) {
                    Object.keys(configuration.viewEvents).forEach(key => this.listenTo(view, key, configuration.viewEvents[key]));
                }
                view.request = this.__handleViewResourceRequest.bind(this);
                this.moduleRegion.show(view);
            }
        }
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
    async __request(configuration, callParams) {
        const params = configuration.url.split('/');
        const showMask = configuration.showLoadingMask !== false;
        showMask && this.view.setModuleLoading(true);
        try {
            const requestFn = Ajax[params[0]][params[1]];
            if (requestFn) {
                const requestType = window.ajaxMap
                    .find(requestTemplate => requestTemplate.className === params[0] && requestTemplate.methodName === params[1])
                    .httpMethod;

                const data = await requestFn.apply(this, callParams);
                configuration.notifications && configuration.notifications.onSuccess && ToastNotificationService.add(configuration.notifications.onSuccess);
                configuration.onSuccess && configuration.onSuccess.call(this, data, callParams);
                return { data, requestType, error: null };
            }
            throw new Error('Please, provide a valid URL');
        } catch (error) {
            configuration.notifications && configuration.notifications.onFailure && ToastNotificationService.add(configuration.notifications.onFailure);
            configuration.onFailure && configuration.onFailure.call(this, error);
            return { data: null, requestType: null, error };
        } finally {
            showMask && this.view.setModuleLoading(false);
        }
    },

    async __handleViewResourceRequest(requestId, requestData) {
        const requestConfig = this.requests[requestId];
        if (requestConfig) {
            const { data, requestType, error } = await this.__request(requestConfig, [ requestData.data ]);

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
                        requestData.model.set(requestData.model.get(requestData.data.id).set(requestData.data), { remove: false });
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
    }
});
