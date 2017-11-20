
import ViewAutoLayout from '../layout/ViewAutoLayout';
import factory from '../layout/index';

export default class View {
    constructor(options) {
        return new factory.Form({
            model: options.model || new Backbone.Model(),
            content: ViewAutoLayout.createCoreView(options.content)
        });
    }
}
