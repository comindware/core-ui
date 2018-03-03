export default Marionette.ItemView.extend({
    modelEvents: {
        change: 'render'
    },
    template: false
});
