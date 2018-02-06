/**
 * Developer: Stanislav Guryev
 * Date: 02.02.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import list from 'list';
import template from '../templates/functionOverload.html';

export default Marionette.View.extend({
    className: 'dev-code-editor-tooltip-title',

    template: Handlebars.compile(template),

    behaviors: {
        ListItemViewBehavior: {
            behaviorClass: list.views.behaviors.ListItemViewBehavior
        }
    },

    triggers: {
        dblclick: 'peek'
    },

    modelEvents: {
        selected: '__onSelected'
    },

    __onSelected() {
        this.trigger('selected');
    }
});
