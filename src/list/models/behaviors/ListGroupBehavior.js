
import CollapsibleBehavior from '../../../models/behaviors/CollapsibleBehavior';

const ListGroupBehavior = function(model) {
    Object.assign(this, new CollapsibleBehavior(model));
};

Object.assign(ListGroupBehavior.prototype, {
    deselect() {
    },

    select() {
    }
});

export default ListGroupBehavior;
