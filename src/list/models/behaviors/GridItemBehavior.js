
import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import HighlightableBehavior from '../../../models/behaviors/HighlightableBehavior';
import CheckableBehavior from '../../../models/behaviors/CheckableBehavior';

export default function(model) {
    Object.assign(this, new SelectableBehavior.Selectable(model));
    Object.assign(this, new CheckableBehavior.CheckableModel(model));
    Object.assign(this, new HighlightableBehavior(model));
}
