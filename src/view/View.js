
import coreApi from '../coreApi';

export default class View {
    constructor(options) {
        return new coreApi.layout.Form({
            model: options.model || new Backbone.Model(),
            schema: options.schema
        });
    }
}
