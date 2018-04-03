import template from '../templates/popoutButton.html';

const classes = {
    EMPTY: 'dev-context-editor__empty'
};

export default Marionette.ItemView.extend({
    tagName: 'span',

    className: 'source-text',

    template: Handlebars.compile(template),

    templateHelpers() {
        const value = this.model.get('value');
        return {
            buttonText: value || Localizer.get('WIDGETS.WTABLE.EMPTYVALUE')
        };
    },

    modelEvents: {
        'change:value': 'render'
    },

    onRender() {
        this.$el.toggleClass(classes.EMPTY, !this.model.get('value'));
    }
});
