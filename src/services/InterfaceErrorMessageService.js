
export default class InterfaceErrorMessageService {
    static initialize() {
        Object.assign(this, Backbone.Events);
    }

    static logError(exception, viewId) {
        this.trigger('InterfaceError', { exception, viewId });
        console.log(exception); //TODO check on listeners, hide if exist
    }
}
