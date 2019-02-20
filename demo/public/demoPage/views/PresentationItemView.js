export default Marionette.View.extend({
    modelEvents: {
        change: 'render'
    },
    template: _.noop,
});
