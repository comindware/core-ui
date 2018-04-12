import template from '../templates/selectButton.html';

export default Marionette.ItemView.extend({
    className: 'type-expression__btn',

    modelEvents: {
        'change:name': 'render'
    },

    template: Handlebars.compile(template)
});
