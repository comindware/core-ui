export default Marionette.View.extend({
    initialize(options) {
        this.collection = options.collection;
        this.listenTo(this.collection, 'change:error', (model: Backbone.Model) => {
            this.$el.toggleClass('layout__tab-layout__header-view-item_error', model.get('error'));
        });
    },

    template: () => '⋮',

    className: 'layout__tab-layout__header-view-item tab-layout__headers-menu'

});
