export default Marionette.View.extend({
    className: 'carousel__dot',

    template: _.noop,

    triggers: {
        click: 'select'
    },

    updateActive(currentIndex) {
        this.$el.toggleClass('carousel__dot_active', this.model.id === currentIndex);
    }
});
