
export default Backbone.Model.extend({
    initialize() {
        Object.assign(this, new Core.list.models.behaviors.ListItemBehavior(this));
    }
});
