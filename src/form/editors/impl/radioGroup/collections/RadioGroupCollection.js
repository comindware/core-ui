import { helpers } from 'utils';
import SelectableBehavior from '../../../../../models/behaviors/SelectableBehavior';
import RadioButtonModel from '../models/RadioButtonModel';

export default Backbone.Collection.extend({
    initialize() {
        helpers.applyBehavior(this, SelectableBehavior.SingleSelect);
    },

    model: RadioButtonModel
});
