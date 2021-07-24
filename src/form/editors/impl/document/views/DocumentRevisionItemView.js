//@flow
import template from '../templates/documentRevisionItem.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    tagName: 'tr',

    templateContext() {
        return {
            version: this.model.get('version') + 1
        };
    }
});
