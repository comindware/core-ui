/**
 * Developer: Ksenia Kartvelishvili
 * Date: 30.08.2017
 * Copyright: 2009-2017 Comindware®
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
