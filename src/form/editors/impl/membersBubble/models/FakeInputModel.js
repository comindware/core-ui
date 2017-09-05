/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.05.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

export default Backbone.Model.extend({
    updateEmpty() {
        this.set('empty', this.collection.models.length === 1);
    }
});
