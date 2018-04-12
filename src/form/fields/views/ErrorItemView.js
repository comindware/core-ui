//@flow
import template from '../templates/errorItem.hbs';

export default Marionette.ItemView.extend({
    tagName: 'li',

    className: 'form-label__error-item',

    template: Handlebars.compile(template),

    templateHelpers() {
        const severity = this.model.get('severity');
        return {
            severity: severity && severity.toLowerCase()
        };
    }
});
