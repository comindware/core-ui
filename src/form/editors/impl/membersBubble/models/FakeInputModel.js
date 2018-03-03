export default Backbone.Model.extend({
    updateEmpty() {
        this.set('empty', this.collection.models.length === 1);
    }
});
