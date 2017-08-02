/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { helpers } from 'utils';
import CollapsibleBehavior from '../../../models/behaviors/CollapsibleBehavior';

const ListGroupBehavior = function(model) {
    _.extend(this, new CollapsibleBehavior(model));
};

_.extend(ListGroupBehavior.prototype, {
    deselect() {
    },

    select() {
    }
});

export default ListGroupBehavior;
