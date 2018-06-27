import template from '../templates/optionItem.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'dropdown-menu__i',

    initialize() {
        this.model.on('selected', this.updateRadio.bind(this));
        this.model.on('deselected', this.updateRadio.bind(this));
    },

    triggers: {
        click: 'execute'
    },

    updateRadio() {
        if (this.model.selected) {
            this.$el.addClass('selected');
        } else {
            this.$el.removeClass('selected');
        }
    },

    onAttach() {
        this.updateRadio();
    }
});
