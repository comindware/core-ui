import template from '../templates/iconButton.html';

export default Marionette.View.extend({
    initialize() {
        this.__setIconColor();
        this.listenTo(this.model, 'change:color', this.__setIconColor);
        this.listenTo(this.model, 'change:iconClass', this.render);
    },

    templateContext() {
        return {
            iconClass: this.model.get('iconClass') || 'level-down-alt'
        };
    },

    template: Handlebars.compile(template),

    triggers: {
        click: {
            event: 'click:item',
            preventDefault: false,
            stopPropagation: false
        }
    },

    className: 'editor_icons',

    __setIconColor() {
        Object.assign(this.el.style, {
            color: this.model.get('color')
        });
    }
});
