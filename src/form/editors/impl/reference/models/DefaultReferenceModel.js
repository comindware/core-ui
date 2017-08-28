/**
 * Developer: Stepan Burguchev
 * Date: 12/12/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import list from 'list';

export default Backbone.Model.extend({
    initialize() {
        _.extend(this, new list.models.behaviors.ListItemBehavior(this));
    }
});
