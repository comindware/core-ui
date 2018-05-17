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
                header: text,
                buttons: buttons.map(button => ({
                    id: button.id,
                    text: button.text,
                    handler() {
                        WindowService.closePopup(this.openedPopupId);
                        this.openedPopupId = null;
                        resolve(button.id);
                    }
                })),
                content: description
            });

            if (this.openedPopupId) {
                WindowService.closePopup(this.openedPopupId);
            }
            this.openedPopupId = WindowService.showPopup(view);
        });
    }
};
