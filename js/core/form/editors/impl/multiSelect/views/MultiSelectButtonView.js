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
        var value = this.model.get('value'),
            collection = this.model.get('collection');

        return {
            displayValue: value && value.length ?
                value.length == collection.length ?
                    Localizer.get('CORE.FORM.EDITORS.MULTISELECT.EVERYTHINGSELECTED') :
                    Localizer.get('CORE.FORM.EDITORS.MULTISELECT.ANYTHINGSELECTED') :
                Localizer.get('CORE.FORM.EDITORS.MULTISELECT.NOTHINGSELECTED')
        };
    },

    events: {
        'click': '__onClick'
    },

    modelEvents: {
        'change:value': 'render'
    },

    initialize: function(options) {
        helpers.ensureOption(options, 'model');
    },

    __onClick: function() {
        this.trigger('open:panel');
    }
});
