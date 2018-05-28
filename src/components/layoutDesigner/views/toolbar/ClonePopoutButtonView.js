//@flow
import template from '../../templates/clonePopoutButton.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'top-nav-error'
});
