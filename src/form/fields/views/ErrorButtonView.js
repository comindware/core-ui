//@flow
import dropdown from 'dropdown';
import template from '../templates/errorButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'form-label__error-button'
});
