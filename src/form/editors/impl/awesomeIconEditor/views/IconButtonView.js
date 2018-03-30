import template from '../templates/iconButton.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    triggers: {
        click: 'click:item'
    },

    className: 'editor_icons'
});
