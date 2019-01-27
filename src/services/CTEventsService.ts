import Backbone from 'backbone';

export default class CTEventsService {
    static initialize() {
        window.addEventListener('storage', event => {
            if (event.key === 'cbEvent') {
                this.__handleStorageEvent(event.newValue);
            }
        });
        Object.assign(this, Backbone.Events);
    }

    static triggerStorageEvent(eventId: string, data: any) {
        localStorage.setItem('cbEvent', JSON.stringify({ id: eventId, data }));
    }

    static __handleStorageEvent(newValue: any) {
        this.trigger('cbEvent', JSON.parse(newValue));
    }
}
