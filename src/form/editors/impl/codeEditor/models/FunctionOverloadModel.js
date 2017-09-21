/**
 * Developer: Stanislav Guryev
 * Date: 02.02.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */


export default Backbone.Model.extend({
    initialize() {
        Core.utils.helpers.applyBehavior(this, Core.list.models.behaviors.ListItemBehavior);
    }
});
