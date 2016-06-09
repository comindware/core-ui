/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.05.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';

export default Backbone.Model.extend({
    updateEmpty: function () {
        this.set('empty', this.collection.models.length === 1);
    }
});
