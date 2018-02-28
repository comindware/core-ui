
import ActionMenuPanelView from './ActionMenuPanelView';
import ActionMenuButtonView from './ActionMenuButtonView';
import { severity } from '../meta';

export default Marionette.ItemView.extend({
    template: false,

    className() {
        return this.model.has('severity') ? severity[this.model.get('severity')].class : 'toolbar-btn';
    },

    onRender() {
        this.menu = new Core.dropdown.factory.createPopout({
            buttonView: ActionMenuButtonView,
            panelView: ActionMenuPanelView,
            panelViewOptions: {
                collection: new Backbone.Collection(this.model.get('items'))
            },
            buttonViewOptions: {
                model: this.model
            },
            customAnchor: true
        });

        this.listenTo(this.menu, 'panel:click:item', this.__handleSeveritySelect);
        this.$el.append(this.menu.render().$el);
    },

    __handleSeveritySelect(view) {
        this.trigger('action:click', view.model);
        this.menu.close();
    }
});
