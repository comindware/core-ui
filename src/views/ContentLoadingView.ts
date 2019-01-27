import template from './templates/contentLoading.html';
import Marionette from 'backbone.marionette';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'loader'
});
