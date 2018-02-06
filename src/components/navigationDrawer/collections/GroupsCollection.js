/**
 * Developer: Alexander Makarov
 * Date: 08.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import SelectableBehavior from '../../../models/behaviors/SelectableBehavior';
import GroupModel from '../models/GroupModel';

export default Backbone.Collection.extend({
    initialize() {
        Object.assign(this, new SelectableBehavior.SingleSelect(this));
    },

    model: GroupModel
});
