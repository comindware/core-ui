export default Backbone.Model.extend({
    initialize() {
        _.extend(this, new Core.list.models.behaviors.ListItemBehavior(this));
    }
});
