//@flow
import CustomActionGroupView from './CustomActionGroupView';
import ActionMenuButtonView from './actionMenu/ActionMenuButtonView';
import { keyCode } from 'utils';

export default class ActionMenuView {
    constructor(options) {
        const items = options.model.get('items');
        const collection = items instanceof Backbone.Collection ? items : new Backbone.Collection(items);
        const menu = Core.dropdown.factory.createDropdown({
            buttonView: ActionMenuButtonView,
            panelView: CustomActionGroupView,
            panelViewOptions: {
                collection,
                class: options.model.get('dropdownClass'),
                mode: options.mode,
                showName: options.showName,
                isPopup: true,
                className() {
                    return `toolbar-panel_container ${this.options.class || ''}`;
                }
            },
            panelPosition: options.isPopup ? 'right' : 'down',
            popoutFlow: 'right',
            buttonViewOptions: {
                model: options.model,
                mode: options.mode,
                showName: options.showName,
                customAnchor: options.customAnchor
            },
            adjustmentPosition: options.adjustmentPosition,
            openOnMouseenter: options.isPopup
        });

        menu.listenTo(menu, 'panel:command:execute', this.__onPanelCommandExecute);
        menu.listenTo(menu, 'keyup', this.__keyup);

        return menu;
    }

    __keyup(buttonView, event) {
        if ([keyCode.ENTER, keyCode.SPACE].includes(event.keyCode)) {
            this.open();
        }
    }

    __onPanelCommandExecute(model, options) {
        this.trigger('action:click', model, options);
        this.close();
    }
}
