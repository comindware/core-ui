/**
 * Developer: Zaycev Ivan
 * Date: 29.06.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/iconButton.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    triggers: {
        click: 'click:item'
    },

    className: 'editor_icons'
});
