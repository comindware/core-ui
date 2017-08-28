/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from '../templates/multiSelectButton.hbs';

export default Marionette.ItemView.extend({
    className: 'input input_dropdown',

    template: Handlebars.compile(template),

    templateHelpers() {
        const items = this.model.get('value');
        const empty = !items || !items.length;
        const collection = this.model.get('collection');

        let displayValue;
        if (empty) {
            displayValue = Localizer.get('CORE.FORM.EDITORS.MULTISELECT.NOTHINGSELECTED');
        } else {
            displayValue = items.map(x => x.get(this.options.displayAttribute)).join(', ');
        }
        return {
            displayValue
        };
    },

    attributes: {
        tabindex: 0
    },

    events: {
        'click .js-clear-button': '__onClear',
        click: '__onClick',
        focus: '__onFocus'
    },

    modelEvents: {
        'change:value': 'render'
    },

    initialize(options) {
        helpers.ensureOption(options, 'model');
    },

    __onClear() {
        this.trigger('value:set', null);
        return false;
    },

    __onClick() {
        this.trigger('open:panel');
    },

    __onFocus() {
        this.trigger('focus');
    }
});
