//@flow
import CustomActionGroupView from './CustomActionGroupView';
import ActionMenuButtonView from './actionMenu/ActionMenuButtonView';
import { keyCode } from 'utils';

export default Marionette.View.extend({
    constructor(options) {
        const menu = Core.dropdown.factory.createDropdown({
            buttonView: ActionMenuButtonView,
            panelView: CustomActionGroupView,
            panelViewOptions: {
                collection: options.model.get('items'),
                class: options.model.get('dropdownClass'),
                mode: options.mode,
                showName: options.showName,
                className() {
                    return `toolbar-panel_container ${this.options.class || ''}`;
                }
            },
            buttonViewOptions: {
                model: options.model,
                mode: options.mode,
                showName: options.showName,
                customAnchor: options.customAnchor
            }
        });

        menu.listenTo(menu, 'panel:command:execute', this.__onPanelCommandExecute);
        menu.listenTo(menu, 'keyup', this.__keyup);
        return menu;
    },

    __keyup(buttonView, event) {
        if ([keyCode.ENTER, keyCode.SPACE].includes(event.keyCode)) {
            this.open();
        }
    },

    __onPanelCommandExecute(model, options) {
        this.trigger('action:click', model, options);
        this.close();
    }
});
