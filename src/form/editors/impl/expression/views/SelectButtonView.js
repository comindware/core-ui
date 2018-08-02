import template from '../templates/selectButton.html';

export default Marionette.View.extend({
    className: 'type-expression__btn',

    modelEvents: {
        'change:name': 'render'
    },

    template: Handlebars.compile(template)
});
