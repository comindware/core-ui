
import list from 'list';

export default Backbone.Model.extend({
    initialize() {
        Object.assign(this, new list.models.behaviors.ListItemBehavior(this));
    }
});
