/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.05.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

export default Backbone.Model.extend({
    updateEmpty() {
        this.set('empty', this.collection.models.length === 1);
    }
});
