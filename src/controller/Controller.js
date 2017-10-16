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

    __handleEvent(data) {
        if (this.eventsHandlers && this.eventsHandlers[data.id]) {
            this.eventsHandlers[data.id](data.data);
        }
    },

    __handleSocketEvent(data) {
        if (this.eventsHandlers && this.moduleId === data.id && this.eventsHandlers.onWebSocketMessage) {
            this.eventsHandlers.onWebSocketMessage.call(this, data.data);
        }
    }
});
