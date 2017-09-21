/**
 * Created by sguryev on 14.07.2017.
 */
import { helpers } from 'utils';
import { Selectable } from '../../models/behaviors/SelectableBehavior';

export default Backbone.Model.extend({
    initialize() {
        helpers.applyBehavior(this, Selectable);
    }
});
