/**
 * Developer: Stanislav Guryev
 * Date: 01.27.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/documentRevisionItem.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    tagName: 'tr',

    templateHelpers() {
        return {
            version: this.model.get('version') + 1,
            isSingleRevision: this.model.collection.length === 1
        };
    }
});
