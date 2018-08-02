import template from './templates/contentLoading.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'loader'
});
