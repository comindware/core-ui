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

const constants = {
    slideToggleDuration: 100
};

export default Marionette.ItemView.extend({
    initialize: function () {
    },

    className: 'msg-popup',

    ui: {
        buttons: '.js-buttons',
        serviceMessageToggle: '.js-service-message-toggle',
        serviceMessage: '.js-service-message'
    },

    events: {
        'click @ui.buttons': '__onSelect',
        'click @ui.serviceMessageToggle': '__toggleServiceMessage'
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
    },

    __toggleServiceMessage() {
        this.ui.serviceMessage.slideToggle(constants.slideToggleDuration);
    }
});
