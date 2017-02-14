/**
 * Developer: Ksenia Kartvelishvili
 * Date: 16.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { htmlHelpers } from '../../../../../../utils/utilsApi';
import { Handlebars } from '../../../../../../libApi';
import list from '../../../../../../list/listApi';
import template from '../templates/listItem.hbs';

export default Marionette.ItemView.extend({
    initialize: function (options) {
    },

    template: Handlebars.compile(template),

    ui: {
        name: '.js-name'
    },

    className: 'dd-list__i',

    behaviors: {
        ListItemViewBehavior: {
            behaviorClass: list.views.behaviors.ListItemViewBehavior
        }
    },

    events: {
        'click': '__select'
    },

    __select: function () {
        this.trigger('member:select', this.model);
    },

    onHighlighted: function (fragment) {
        var text = htmlHelpers.highlightText(this.model.get('name'), fragment);
        this.ui.name.html(text);
    },

    onUnhighlighted: function () {
        this.ui.name.text(this.model.get('name'));
    }
});
