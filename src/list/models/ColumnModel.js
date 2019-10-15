export default Backbone.AssociatedModel.extend({
    getIsHidden() {
        return this.get('isHidden');
    }
});
