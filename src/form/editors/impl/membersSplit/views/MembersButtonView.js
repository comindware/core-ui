/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/membersButton.html';

export default Marionette.ItemView.extend({
    className: 'dev-members-editor__dropdown-view__button-view',

    template: Handlebars.compile(template)
});
