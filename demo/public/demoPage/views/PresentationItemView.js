export default Marionette.View.extend({
    modelEvents: {
        change: 'render'
    },
    template: false
});
