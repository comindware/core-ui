/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import template from '../templates/multiSelectButton.hbs';

export default Marionette.ItemView.extend({
    className: 'input input_dropdown',

    template: Handlebars.compile(template),

    templateHelpers: function() {
        let items = this.model.get('value');
        let empty = !items || !items.length;
        let collection = this.model.get('collection');

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
        'click': '__onClick',
        'focus': '__onFocus'
    },

    modelEvents: {
        'change:value': 'render'
    },

    initialize: function(options) {
        helpers.ensureOption(options, 'model');
    },

    __onClear () {
        this.trigger('value:set', null);
        return false;
    },

    __onClick: function() {
        this.trigger('open:panel');
    },

    __onFocus: function () {
        this.trigger('focus');
    }
});
