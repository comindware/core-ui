import { validationSeverityTypes, validationSeverityClasses } from 'Meta';
import template from './templates/errorButton.hbs';

export default Marionette.View.extend({
    initialize() {
        const errorCollection = this.model?.get('errorCollection');
        if (errorCollection) {
            this.listenTo(errorCollection, 'add remove reset', () => (this.el.className = this.className()));
        }
    },

    template: Handlebars.compile(template),

    className() {
        let severityPart = validationSeverityClasses.ERROR;
        const errorCollection = this.model?.get('errorCollection');
        if (errorCollection?.length && errorCollection.every(error => error.has('severity') && error.get('severity')?.toLowerCase() === validationSeverityTypes.WARNING)) {
            severityPart = validationSeverityClasses.WARNING;
        }
        return `js-field-error-button form-label__${severityPart}-button fa fa-exclamation-circle`;
    },

    tagName: 'i'
});
