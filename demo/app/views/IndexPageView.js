import template from 'text-loader!../templates/indexPage.html';

export default Marionette.View.extend({
    className: 'demo-welcome',

    template: Handlebars.compile(template)
});
