import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import HighlightableBehavior from '../../../models/behaviors/HighlightableBehavior';
import CheckableBehavior from '../../../models/behaviors/CheckableBehavior';

export default class extends CheckableBehavior.CheckableModel {
    constructor(model) {
        super(model);
        _.extend(this, new SelectableBehavior.Selectable(model));
        _.extend(this, new HighlightableBehavior(model));
    }
}
