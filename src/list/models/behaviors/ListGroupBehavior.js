import CollapsibleBehavior from '../../../models/behaviors/CollapsibleBehavior';

const ListGroupBehavior = function(model) {
    _.extend(this, new CollapsibleBehavior(model));
};

_.extend(ListGroupBehavior.prototype, {
    deselect() {
    },

    select() {
    }
});

export default ListGroupBehavior;
