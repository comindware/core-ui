import CollapsibleBehavior from '../../../models/behaviors/CollapsibleBehavior';

const ListGroupBehavior = function(model) {
    Object.Assign(this, new CollapsibleBehavior(model));
};

Object.Assign(ListGroupBehavior.prototype, {
    deselect() {},

    select() {}
});

export default ListGroupBehavior;
