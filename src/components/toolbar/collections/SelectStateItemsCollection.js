import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import SelectStateItemModel from '../models/SelectStateItemModel';

export default Backbone.Collection.extend({
    initialize() {
        _.extend(this, new SelectableBehavior.SingleSelect(this));
    },

    model: SelectStateItemModel
});
