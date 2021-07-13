export default Marionette.View.extend({
    initialize(options) {
        this.collection = options.collection;
        this.listenTo(this.collection, 'change:error', this.setErrorIfNeeded);
    },

    template: () => '&#8942;',

    className: 'layout__tab-layout__header-view-item tab-layout__headers-menu',

    onRender() {
        this.setErrorIfNeeded();
    },

    setErrorIfNeeded() {
        this.$el.toggleClass('layout__tab-layout__header-view-item_error', this.isError());
    },

    isError() {
        return this.collection.some((model: Backbone.Model) => model.get('error'));
    }
});
