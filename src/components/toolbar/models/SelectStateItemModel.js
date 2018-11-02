import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import meta from '../meta';

export default Backbone.Model.extend({
    initialize() {
        _.extend(this, new SelectableBehavior.Selectable(this));
    },

    defaults: {
        type: meta.toolbarItemType.SELECTITEM
    }
});
