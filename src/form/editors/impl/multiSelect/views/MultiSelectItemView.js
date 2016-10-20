/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import list from '../../../../../list/listApi';
import { Handlebars } from '../../../../../libApi';
import template from '../templates/multiSelectItem.hbs';

var classes = {
    BASE: 'multiselect-i',
    SELECTED: 'multiselect-i_selected'
};

export default Marionette.ItemView.extend({
    className: classes.BASE,

    template: Handlebars.compile(template),

    templateHelpers: function() {
        var displayAttribute = this.getOption('displayAttribute');

        return {
            text: _.result(this.model.toJSON(), displayAttribute)
        };
    },

    events: {
        'click': '__toggle'
    },

    modelEvents: {
        'select': '__markSelected',
        'deselect': '__markDeselected'
    },

    __toggle: function() {
        if (this.model.selected) {
            this.model.trigger('deselect', this.model);
        } else {
            this.model.trigger('select', this.model);
        }
    },

    __markSelected: function() {
        this.$el.addClass(classes.SELECTED);
    },

    __markDeselected: function() {
        this.$el.removeClass(classes.SELECTED);
    }
});
