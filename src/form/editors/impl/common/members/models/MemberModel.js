/**
 * Developer: Ksenia Kartvelishvili
 * Date: 16.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { helpers } from 'utils';
import list from 'list';

export default Backbone.Model.extend({
    initialize() {
        helpers.applyBehavior(this, list.models.behaviors.ListItemBehavior);
    },

    matchText(text) {
        const name = this.get('name');
        const userName = this.get('userName');
        return (name && name.toLowerCase().indexOf(text) !== -1) ||
               (userName && userName.toLowerCase().indexOf(text) !== -1);
    }
});
