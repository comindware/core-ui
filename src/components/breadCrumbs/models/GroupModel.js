//@flow
import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';

export default Backbone.Model.extend({
    initialize() {
        Object.assign(this, new SelectableBehavior.Selectable(this));
    }
});
