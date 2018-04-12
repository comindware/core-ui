import template from '../templates/loading.hbs';

export default Marionette.ItemView.extend({
    initialize() {},

    className: 'l-loader',

    template: Handlebars.compile(template)
});
