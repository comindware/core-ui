export default Backbone.Model.extend({
    initialize({ uniqueId, id, streamId } = {}, options) {
        if (!uniqueId) {
            this.set({ uniqueId: id || streamId });
        }
    }
});
