import template from '../templates/popoutButton.html';

const classes = {
    EMPTY: 'dev-context-editor__empty'
};

export default Marionette.View.extend({
    tagName: 'span',

    className: 'source-text',

    template: Handlebars.compile(template),

    templateContext() {
        const value = this.model.get('value');
        return {
            buttonText: value || Localizer.get('CORE.GRID.NOTSET')
        };
    },

    modelEvents: {
        'change:value': 'render'
    },

    onRender() {
        this.$el.toggleClass(classes.EMPTY, !this.model.get('value'));
    }
});
