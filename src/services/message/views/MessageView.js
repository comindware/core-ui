/**
 * Developer: Stepan Burguchev
 * Date: 4/23/2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from '../../../libApi';
import template from '../templates/message.hbs';
import WindowService from '../../WindowService';
import LocalizationService from '../../LocalizationService';

export default Marionette.ItemView.extend({
    initialize: function () {
    },

    className: 'msg-popup',

    ui: {
        buttons: '.js-buttons'
    },

    events: {
        'click @ui.buttons': '__onSelect'
    },

    template: Handlebars.compile(template),

    close: function (result) {
        WindowService.closePopup();
        this.trigger('close', result);
    },

    __onSelect: function (e) {
        var index = this.ui.buttons.index(e.target);
        var buttonModel = this.model.get('buttons')[index];
        var result = buttonModel.id;
        this.close(result);
    }
});
