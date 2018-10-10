export default Marionette.View.extend({
    template: Handlebars.compile('<span>{{text}}</span>'),

    templateContext() {
        return {
            text: this.options.text
        };
    },

    className: 'fr-dropdown-message'
});
