//@flow
import { helpers } from 'utils';
import SelectableBehavior from '../../../../../models/behaviors/SelectableBehavior';

export default Backbone.Model.extend({
    initialize() {
        helpers.applyBehavior(this, SelectableBehavior.Selectable);
    }
});
