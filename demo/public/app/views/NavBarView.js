import template from 'text-loader!../templates/navBarItem.html';

export default Marionette.View.extend({
    className: 'demo-nav',

    templateContext() {
        return {
            items: this.collection.toJSON()
        };
    },

    template: Handlebars.compile(template)
});
