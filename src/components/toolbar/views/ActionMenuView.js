//@flow
import ActionMenuPanelView from './actionMenu/ActionMenuPanelView';
import ActionMenuButtonView from './actionMenu/ActionMenuButtonView';

export default Marionette.View.extend({
    constructor(options) {
        const menu = Core.dropdown.factory.createDropdown({
            buttonView: ActionMenuButtonView,
            panelView: ActionMenuPanelView,
            panelViewOptions: {
                collection: options.model.get('items'),
                class: options.model.get('dropdownClass')
            },
            buttonViewOptions: {
                model: options.model
            }
        });

        menu.listenTo(menu, 'panel:click:item', this.__handleSeveritySelect);
        return menu;
    },

    __handleSeveritySelect(model) {
        this.trigger('action:click', model);
        this.close();
    }
});
