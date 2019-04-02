import template from '../templates/popoutButton.html';

export default Marionette.View.extend({
    tagName: 'span',

    className: 'source-text',

    template: Handlebars.compile(template),

    templateContext() {
        const value = this.model.get('value');
        return {
            buttonText: value || this.model.get('placeholder')
        };
    },

    modelEvents: {
        'change:value': 'render',
        'change:placeholder': 'render'
    }
});
