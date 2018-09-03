import list from 'list';

export default Backbone.Model.extend({
    initialize() {
        _.extend(this, new list.models.behaviors.ListItemBehavior(this));
    },

    parse(data) {
        if (typeof data === 'string') {
            return { name: data, id: data };
        }
        return data;
    }
});
