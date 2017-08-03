/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import template from '../templates/referenceListItem.hbs';
import list from 'list';

export default Marionette.ItemView.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },

    behaviors: {
        ListItemViewBehavior: {
            behaviorClass: list.views.behaviors.ListItemViewBehavior
        }
    },

    className: 'dd-list__i',

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            text: this.options.getDisplayText(this.model.toJSON())
        };
    },

    events: {
        click: '__select'
    },

    __select() {
        this.reqres.request('value:set', this.model);
    }
});
