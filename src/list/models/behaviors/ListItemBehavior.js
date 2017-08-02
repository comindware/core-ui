/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { helpers } from 'utils';
import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import HighlightableBehavior from '../../../models/behaviors/HighlightableBehavior';

export default function(model) {
    _.extend(this, new SelectableBehavior.Selectable(model));
    _.extend(this, new HighlightableBehavior(model));
}
