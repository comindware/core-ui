import template from 'text-loader!../templates/indexPage.html';

export default Marionette.ItemView.extend({
    className: 'demo-welcome',

    template: Handlebars.compile(template)
});
