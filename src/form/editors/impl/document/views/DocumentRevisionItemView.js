//@flow
import template from '../templates/documentRevisionItem.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    tagName: 'tr',

    templateHelpers() {
        return {
            version: this.model.get('version') + 1,
            isSingleRevision: this.model.collection.length === 1
        };
    }
});
