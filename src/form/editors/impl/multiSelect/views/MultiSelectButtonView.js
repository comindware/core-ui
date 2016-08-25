/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import template from '../templates/multiSelectButton.hbs';

export default Marionette.ItemView.extend({
    className: 'input input_dropdown',

    template: template,

    templateHelpers: function() {
        let items = this.model.get('value'),
            empty = !items || !items.length,
            collection = this.model.get('collection');

        let displayValue;
        if (empty) {
            displayValue = Localizer.get('CORE.FORM.EDITORS.MULTISELECT.NOTHINGSELECTED');
        } else {
            displayValue = items.map(x => x.get(this.options.displayAttribute)).join(', ');
        }
        return {
            displayValue: displayValue
        };
    },

    attributes: {
        tabindex: 0
    },

    events: {
        'click': '__onClick',
        'focus': '__onFocus'
    },

    modelEvents: {
        'change:value': 'render'
    },

    initialize: function(options) {
        helpers.ensureOption(options, 'model');
    },

    __onClick: function() {
        this.trigger('open:panel');
    },

    __onFocus: function () {
        this.trigger('focus');
    }
});
