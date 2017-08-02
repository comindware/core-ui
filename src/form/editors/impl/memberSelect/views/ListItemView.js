/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import { htmlHelpers } from 'utils';
import template from '../templates/listItem.hbs';
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

    ui: {
        fullName: '.js-fullName'
    },

    templateHelpers() {
        return {
            text: this.__getText()
        };
    },

    __getText() {
        return this.model.get('name') || this.model.get('userName');
    },

    onHighlighted(fragment) {
        const text = htmlHelpers.highlightText(this.__getText(), fragment);
        this.ui.fullName.html(text);
    },

    onUnhighlighted() {
        this.ui.fullName.text(this.__getText());
    },

    events: {
        click: '__select'
    },

    __select() {
        this.reqres.request('value:set', this.model.id);
    }
});
