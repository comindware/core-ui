/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import template from '../templates/referenceListItem.hbs';

const classes = {
    BASE: 'multiselect-i',
    SELECTED: 'multiselect-i_selected'
};

export default Marionette.ItemView.extend({
    className() {
        return `dd-list__i${this.options.showCheckboxes ? ' dev_dd-list__i_with_checkbox' : ''}`;
    },

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            text: this.options.getDisplayText(this.model.toJSON()),
            showCheckboxes: this.options.showCheckboxes
        };
    },

    modelEvents: {
        select: '__markSelected',
        deselect: '__markDeselected'
    },

    __markSelected() {
        this.$el.addClass(classes.SELECTED);
    },

    __markDeselected() {
        this.$el.removeClass(classes.SELECTED);
    }
});
