//@flow
import template from './templates/errorItem.hbs';

export default Marionette.View.extend({
    tagName: 'li',

    className: 'form-label__error-item',

    template: Handlebars.compile(template),

    templateContext() {
        const severity = this.model.get('severity');
        return {
            severity: severity && severity.toLowerCase()
        };
    }
});
