/**
 * Created by sguryev on 14.07.2017.
 */
import { helpers } from 'utils';
import { MultiSelect } from '../../models/behaviors/SelectableBehavior';
import SelectableModel from '../models/SelectableModel';

export default Backbone.Collection.extend({
    initialize() {
        helpers.applyBehavior(this, MultiSelect);
    },

    model: SelectableModel
});
