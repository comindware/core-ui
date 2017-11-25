
import coreApi from '../coreApi';

export default {
    createView(options) {
        return new coreApi.layout.Form({
            model: options.model || new Backbone.Model(),
            schema: options.schema
        });
    }
};
