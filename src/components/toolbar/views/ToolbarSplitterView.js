//@flow
export default Marionette.View.extend({
    initialize() {
        this.model.set('name', '');
    },

    className: 'btn-separator',

    template: false
});
