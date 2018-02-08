/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import HighlightableBehavior from '../../../models/behaviors/HighlightableBehavior';

export default function(model) {
    Object.assign(this, new SelectableBehavior.Selectable(model));
    Object.assign(this, new HighlightableBehavior(model));
}
