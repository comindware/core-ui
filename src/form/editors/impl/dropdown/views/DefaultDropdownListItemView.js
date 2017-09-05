/**
 * Developer: Stepan Burguchev
 * Date: 1/16/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import { htmlHelpers } from 'utils';
import list from 'list';
import template from '../templates/defaultDropdownListItem.hbs';

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
        const model = this.model.toJSON();
        const displayAttribute = this.options.displayAttribute;
        return {
            text: _.result(model, displayAttribute)
        };
    },

    events: {
        click: '__select'
    },

    onHighlighted(fragment) {
        const text = htmlHelpers.highlightText(this.model.get(this.options.displayAttribute), fragment);
        this.$el.html(text);
    },

    onUnhighlighted() {
        this.$el.html(this.model.get(this.options.displayAttribute));
    },

    __select() {
        this.reqres.request('value:set', this.model);
        return false;
    }
});
