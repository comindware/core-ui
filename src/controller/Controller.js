/**
 * Developer: Vladislav Smirnov
 * Date: 10.9.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import CTEventsService from '../services/CTEventsService';
import WebSocketService from '../services/WebSocketService';

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

    async handleRouterEvent(configuration, callParams) { //todo call view Actions
        const data = await this.__request(configuration, callParams);
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

    //toto extract view params
    async __request(configuration, callParams) { //todo notifications
        const params = configuration.url.split('/');
        configuration.showLoadingMask && this.view.setModuleLoading(true);
        try {
            let data;
            if (callParams.length === 1 && callParams[0] === null) {
                data = await Ajax[params[0]][params[1]]();
            } else {
                data = await Ajax[params[0]][params[1]](callParams);
            }
            //configuration.notifications && configuration.notifications.onSuccess && noti.add(configuration.notifications.onSuccess);
            configuration.onSuccess && configuration.onSuccess.call(this, data, callParams); //todo !!!!
            return data;
        } catch (e) {
            //configuration.notifications && configuration.notifications.onFailure && noti.add(configuration.notifications.onFailure);
            configuration.onFailure && configuration.onFailure.call(this, e);
        } finally {
            configuration.showLoadingMask && this.view.setModuleLoading(false);
        }
    }
});
