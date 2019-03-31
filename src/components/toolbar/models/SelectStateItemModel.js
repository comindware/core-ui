import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import { toolbarItemType } from '../meta';

export default Backbone.Model.extend({
    initialize() {
        _.extend(this, new SelectableBehavior.Selectable(this));
    },

    defaults: {
        type: toolbarItemType
    }
});
