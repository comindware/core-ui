export default Backbone.Model.extend({
    initialize() {
        const items = this.get('items');
        if (Array.isArray(items)) {
            this.set('items', new Backbone.Collection(items));
        }
    }
});
