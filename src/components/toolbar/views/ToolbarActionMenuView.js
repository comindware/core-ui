//@flow
import ActionMenuPanelView from './ActionMenuPanelView';
import ActionMenuButtonView from './ActionMenuButtonView';

export default Marionette.View.extend({
    template: false,

    onRender() {
        this.menu = Core.dropdown.factory.createDropdown({
            buttonView: ActionMenuButtonView,
            panelView: ActionMenuPanelView,
            panelViewOptions: {
                collection: new Backbone.Collection(this.model.get('items')),
                class: this.model.get('dropdownClass')
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
