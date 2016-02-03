/**
 * Developer: Ksenia Kartvelishvili
 * Date: 16.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers } from '../../../../../../utils/utilsApi';
import list from '../../../../../../list/listApi';

export default Backbone.Model.extend({
    initialize: function () {
        helpers.applyBehavior(this, list.models.behaviors.ListItemBehavior);
    },

    matchText: function (text) {
        var name = this.get('name');
        var userName = this.get('userName');
        return (name && name.toLowerCase().indexOf(text) !== -1) ||
               (userName && userName.toLowerCase().indexOf(text) !== -1);
    }
});
