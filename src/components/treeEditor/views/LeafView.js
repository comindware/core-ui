import template from '../templates/leaf.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.model.get('name')
        };
    }
});
