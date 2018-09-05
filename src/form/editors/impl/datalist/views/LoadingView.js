import template from '../templates/loading.hbs';

export default Marionette.View.extend({
    className: 'spinner',

    template: Handlebars.compile(template)
});
