/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from '../../../../../libApi';
import template from '../templates/referenceListItem.hbs';
import list from '../../../../../list/listApi';

export default Marionette.ItemView.extend({
    initialize: function (options) {
        this.reqres = options.reqres;
    },

    behaviors: {
        ListItemViewBehavior: {
            behaviorClass: list.views.behaviors.ListItemViewBehavior
        }
    },

    className: 'dd-list__i',

    template: Handlebars.compile(template),

    templateHelpers: function () {
        return {
            text: this.options.getDisplayText(this.model.toJSON())
        };
    },

    events: {
        'click': '__select'
    },

    __select: function () {
        this.reqres.request('value:set', this.model);
    }
});
