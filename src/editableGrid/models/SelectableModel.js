import { helpers } from 'utils';
import { Selectable } from '../../models/behaviors/SelectableBehavior';

export default Backbone.Model.extend({
    initialize() {
        helpers.applyBehavior(this, Selectable);
    }
});
