import ErrorPlaceholderView from './templates/ErrorPlaceholder.hbs';
import Marionette from 'backbone.marionette';
import _ from 'underscore';

export default Marionette.View.extend({
    initialize() {
        this.id = _.uniqueId('failed-view_');
    },

    templateContext() {
        return {
            id: this.id,
            placeholderText: Localizer.get('CORE.FORM.FIELDS.ERRORFIELD')
        };
    },

    template: Handlebars.compile(ErrorPlaceholderView),

    getId() {
        return this.id;
    },

    validate() {
        return undefined;
    }
});
