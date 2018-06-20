export default Backbone.Model.extend({
    initialize() {
        Object.Assign(this, new Core.list.models.behaviors.ListItemBehavior(this));
    }
});
