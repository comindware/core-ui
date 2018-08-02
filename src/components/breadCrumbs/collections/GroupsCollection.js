//@flow
import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import GroupModel from '../models/GroupModel';

export default Backbone.Collection.extend({
    initialize() {
        Object.assign(this, new SelectableBehavior.SingleSelect(this));
    },

    model: GroupModel
});
