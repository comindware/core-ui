import template from '../templates/iconButton.html';

export default Marionette.View.extend({
    initialize() {
        this.__setIconColor();
        this.listenTo(this.model, 'change:color', this.__setIconColor);
        this.listenTo(this.model, 'change:iconClass', this.render);
    },

    template: Handlebars.compile(template),

    triggers: {
        click: 'click:item'
    },

    className: 'editor_icons',

    __setIconColor() {
        this.$el.css({ color: this.model.get('color') });
    }
});
