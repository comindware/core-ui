
import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import HighlightableBehavior from '../../../models/behaviors/HighlightableBehavior';

export default function(model) {
    Object.assign(this, new SelectableBehavior.Selectable(model));
    Object.assign(this, new HighlightableBehavior(model));
}
