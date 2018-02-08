
export default Backbone.Model.extend({
    initialize() {
        Core.utils.helpers.applyBehavior(this, Core.list.models.behaviors.ListItemBehavior);
    }
});
