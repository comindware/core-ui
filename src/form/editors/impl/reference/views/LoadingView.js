import template from '../templates/loading.hbs';

export default Marionette.View.extend({
    initialize() {},

    className: 'l-loader',

    template: Handlebars.compile(template)
});
