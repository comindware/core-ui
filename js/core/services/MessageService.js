/**
 * Developer: Stepan Burguchev
 * Date: 4/23/2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import MessageView from './message/views/MessageView';
import WindowService from './WindowService';
import LocalizationService from './LocalizationService';

var iconIds = {
    NONE: 'none',
    QUESTION: 'question',
    ERROR: 'error'
};

export default {
    confirm: function (description) {
        return this.askYesNo(description, LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.CONFIRMATION'));
    },

    askYesNo: function (description, text) {
        return this.showMessageDialog(description, text, [
            {
                id: true,
                text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.YES')
            },
            {
                id: false,
                text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.NO'),
                default: true
            }
        ], iconIds.QUESTION);
    },

    error: function (description, text) {
        text = text || LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.ERROR');
        return this.showMessageDialog(description, text, [
            {
                id: false,
                text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.OK'),
                default: true
            }
        ], iconIds.ERROR);
    },

    showMessageDialog: function (description, text, buttons, iconId) {
        iconId = iconId || iconIds.NONE;
        var deferred = Promise.pending();
        var view = new MessageView({
            model: new Backbone.Model({
                iconId: iconId,
                text: text,
                description: description,
                buttons: buttons || []
            })
        });
        view.once('close', function (result) {
            deferred.resolve(result);
        });
        WindowService.showPopup(view, { fadeOut: false });
        return deferred.promise;
    }
};
