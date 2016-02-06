/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
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

    template: template,

    templateHelpers: function () {
        return {
            text: this.model.get('text') || '#' + this.model.id
        };
    },

    events: {
        'click': '__select'
    },

    __select: function () {
        this.reqres.request('value:set', this.model);
    }
});
