/**
 * Developer: Stepan Burguchev
 * Date: 8/14/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from 'text-loader!../templates/demoDropdownItem.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'dropdown-list__i'
});
