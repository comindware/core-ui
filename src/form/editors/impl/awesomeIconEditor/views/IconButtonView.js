
import template from '../templates/iconButton.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    triggers: {
        click: 'click:item'
    },

    className: 'editor_icons'
});
