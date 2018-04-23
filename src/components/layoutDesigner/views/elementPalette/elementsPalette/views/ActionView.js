import template from '../templates/action.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'ld-list-toolbar__btn',

    templateContext() {
        return {
            iconClass: this.model.get('icon') || 'plus'
        };
    },

    triggers: {
        click: 'action:clicked'
    }
});
