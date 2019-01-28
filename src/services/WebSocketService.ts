import Backbone from 'backbone';

export default class WebSocketService {
    static socket: WebSocket;
    static isConnectionOpened: boolean;

    static initialize(options = {}) {
        Object.assign(this, Backbone.Events);
        this.isConnectionOpened = true;
        this.socket = new WebSocket(options.url);

        this.socket.onopen = () => this.__handleSocketOpen();
        this.socket.onclose = () => this.__handleSocketClosed();
        this.socket.onmessage = data => this.__handleSocketMessage(data);
        this.socket.onerror = error => this.trigger('ws:error', { id: 'onWebSocketError', data: error });
    }

    static close() {
        this.socket.close();
    }

    static send(eventId: string, data) {
        try {
            this.socket.send(JSON.stringify({ id: eventId, data }));
        } catch (e) {
            console.log(e);
        }
    }

    static __handleSocketMessage(data) {
        try {
            this.trigger('ws:message', JSON.parse(data.data));
        } catch (e) {
            console.log(e);
        }
    }

    static __handleSocketOpen() {
        this.isConnectionOpened = true;
        this.trigger('ws:open', { id: 'onWebSocketOpen', data: null });
    }

    static __handleSocketClosed() {
        this.isConnectionOpened = false;
        this.trigger('ws:closed', { id: 'onWebSocketClose', data: null });
    }

    static isConnected() {
        return this.isConnectionOpened;
    }
}
