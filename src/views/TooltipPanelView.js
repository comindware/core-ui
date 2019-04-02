export default Marionette.View.extend({
    modelEvents: {
        change: 'onChange'
    },

    className: 'form-label__tooltip-panel',

    template: _.noop,

    onRender() {
        this.$el.text(this.model.get(this.options.textAttribute));
    },

    onChange() {
        this.$el.text(this.model.get(this.options.textAttribute));
    }
});
