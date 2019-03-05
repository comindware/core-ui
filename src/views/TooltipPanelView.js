//@flow
export default Marionette.View.extend({
    modelEvents: {
        change: 'onChange'
    },

    className: 'form-label__tooltip-panel',

    template: false,

    onRender() {
        this.$el.text(this.model.get(this.options.textAttribute));
    },

    onChange() {
        this.$el.text(this.model.get(this.options.textAttribute));
    }
});
