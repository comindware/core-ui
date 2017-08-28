/**
 * Developer: Stepan Burguchev
 * Date: 4/23/2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import MessageView from './message/views/MessageView';
import WindowService from './WindowService';
import LocalizationService from './LocalizationService';

const iconIds = {
    NONE: 'none',
    QUESTION: 'question',
    ERROR: 'error'
};

export default {
    confirm(description) {
        return this.askYesNo(description, LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.CONFIRMATION'));
    },

    askYesNo(description, text) {
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

    error(description, text) {
        text = text || LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.ERROR');
        return this.showMessageDialog(description, text, [
            {
                id: false,
                text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.OK'),
                default: true
            }
        ], iconIds.ERROR);
    },

    showMessageDialog(description, text, buttons, iconId) {
        iconId = iconId || iconIds.NONE;
        return new Promise(resolve => {
            const view = new MessageView({
                model: new Backbone.Model({
                    iconId,
                    text,
                    description,
                    buttons: buttons || []
                })
            });
            view.once('close', result => {
                this.openedPopupId = null;
                resolve(result);
            });
            if (this.openedPopupId) {
                WindowService.closePopup(this.openedPopupId);
            }
            this.openedPopupId = WindowService.showPopup(view);
        });
    }
};
