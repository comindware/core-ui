/**
 * Developer: Alexander Makarov
 * Date: 08.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from 'text-loader!../templates/groupItem.html';

const classes = {
    selected: 'selected'
};

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    tagName: 'li',

    onRender() {
        this.$el.toggleClass(classes.selected, !!this.model.selected);
    },

    className: 'demo-groups__li'
});
