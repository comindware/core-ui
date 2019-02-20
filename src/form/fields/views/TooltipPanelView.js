//@flow
export default Marionette.View.extend({
    modelEvents: {
        change: 'onChangeText'
    },

    className: 'form-label__tooltip-panel',

    template: _.noop,

    onRender() {
        this.$el.text(this.model.get(this.options.textAttribute));
    },

    onChangeText() {
        this.$el.text(this.model.get(this.options.textAttribute));
    }
});
