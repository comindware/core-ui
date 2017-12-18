
import ErrorPlaceholderView from './templates/ErrorPlaceholder.hbs';

export default Marionette.ItemView.extend({
    initialize() {
        this.id = _.uniqueId('failed-view_');
    },

    templateHelpers() {
        return {
            id: this.id,
            placeholderText: 'Something went wrong'
        };
    },

    template: Handlebars.compile(ErrorPlaceholderView),

    getId() {
        return this.id;
    }
});
