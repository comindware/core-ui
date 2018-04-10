//@flow
import ActionMenuPanelView from './ActionMenuPanelView';
import ActionMenuButtonView from './ActionMenuButtonView';
import { severity } from '../meta';

export default Marionette.ItemView.extend({
    template: false,

    className() {
        const severityLevel = this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.None;

        return this.model.has('severity') ? severityItem.class : 'toolbar-btn';
    },

    onRender() {
        this.menu = new Core.dropdown.factory.createDropdown({
            buttonView: ActionMenuButtonView,
            panelView: ActionMenuPanelView,
            panelViewOptions: {
                collection: new Backbone.Collection(this.model.get('items'))
            },
            buttonViewOptions: {
                model: this.model
            }
        });

        this.listenTo(this.menu, 'panel:click:item', this.__handleSeveritySelect);
        this.$el.append(this.menu.render().$el);
    },

    __handleSeveritySelect(view) {
        this.trigger('action:click', view.model);
        this.menu.close();
    }
});
