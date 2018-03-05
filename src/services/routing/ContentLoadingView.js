import template from './templates/contentLoading.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    className: 'loader'
});
