import WindowService from './WindowService';
import LocalizationService from './LocalizationService';

const iconIds = {
    NONE: 'none',
    QUESTION: 'question',
    ERROR: 'error'
};

export default {
    systemMessagesTypes: {
        unsavedChanges: 'unsavedChanges'
    },

    confirm(description) {
        return this.askYesNo(description, LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.CONFIRMATION'));
    },

    askYesNo(description, text) {
        return this.showMessageDialog(
            description,
            text,
            [
                {
                    id: true,
                    text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.YES')
                },
                {
                    id: false,
                    text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.NO'),
                    default: true
                }
            ],
            iconIds.QUESTION
        );
    },

    error(description, text = LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.ERROR')) {
        return this.showMessageDialog(
            description,
            text,
            [
                {
                    id: false,
                    text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.OK'),
                    default: true
                }
            ],
            iconIds.ERROR
        );
    },

    showMessageDialog(description, text, buttons, iconId = iconIds.NONE) {
        return new Promise(resolve => {
            const view = new Core.layout.Popup({
                size: {
                    width: 'auto',
                    height: 'auto',
                    'min-width': '300px'
                }, //don't use min-values if fullscreenToggleDisabled: false
                fullscreenToggleDisabled: true,
                header: text,
                buttons: buttons.map(button => ({
                    id: button.id,
                    text: button.text,
                    customClass: button.customClass,
                    handler() {
                        if (button.beforeLeaveFn) {
                            button.beforeLeaveFn().then(() => {
                                WindowService.closePopup(this.openedPopupId);
                                this.openedPopupId = null;
                                resolve(true);
                            });
                        } else {
                            WindowService.closePopup(this.openedPopupId);
                            this.openedPopupId = null;
                            resolve(button.id);
                        }
                    }
                })),
                content: `<div class='systemMessageBody'>${description}</div>`
            });

            if (this.openedPopupId) {
                WindowService.closePopup(this.openedPopupId);
            }
            this.openedPopupId = WindowService.showPopup(view);
        });
    },

    showSystemMessage(messageConfiguration) {
        const buttons = [
            {
                id: true,
                text: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.LEAVE'),
                customClass: 'btn-small btn-outline'
            },
            {
                id: false,
                text: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.STAY'),
                customClass: 'btn-small'
            }
        ];

        if (messageConfiguration.beforeLeaveFn) {
            buttons.unshift({
                id: 'saveAndLeave',
                text: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.SAVEANDLEAVE'),
                customClass: 'btn-small',
                beforeLeaveFn: messageConfiguration.beforeLeaveFn
            });
        }

        const systemMessages = {
            unsavedChanges: {
                description: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.DESCRIPTION'),
                buttons
            }
        };

        switch (messageConfiguration.type) {
            case this.systemMessagesTypes.unsavedChanges: {
                return this.showMessageDialog(systemMessages.unsavedChanges.description, systemMessages.unsavedChanges.text, systemMessages.unsavedChanges.buttons);
            }
            default:
                break;
        }
    }
};
