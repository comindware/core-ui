/**
 * Developer: Ksenia Kartvelishvili
 * Date: 22.01.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/script.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    ui: {
        scriptInput: '.js-script-input'
    },

    regions: {
    },

    className: 'pp-setting__textarea',

    getValue() {
        return this.ui.scriptInput.val();
    },

    setValue(value) {
        this.value = value;
    },

    onRender() {
        this.ui.scriptInput.val(this.value);
    }
});
