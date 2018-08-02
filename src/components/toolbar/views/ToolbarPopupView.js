//@flow
import ButtonView from './ButtonView';

export default ButtonView.extend({
    events: {
        'click .js-action': '__openPopout'
    },

    onRender() {
        this.__showMenu();
    },

    __openPopout() {
        this.popup.open();
    },

    __closePopout() {
        this.popup.close();
    },

    async __showMenu() {
        const reqres = this.getOption('reqres');
        const options = this.model.get('options');

        this.popup = Core.dropdown.factory.createPopout({
            customAnchor: true,
            buttonView: options.buttonView,
            panelView: options.panelView,
            panelViewOptions: options,
            popoutFlow: 'right',
            popoutDirection: 'down'
        });

        this.listenTo(this.popup, 'panel:click:row', model => {
            this.__closePopout();
            reqres.request('form:clone', model.id);
        });
        this.$el.append(this.popup.render().$el);
    },

    onDestroy() {
        this.popup.destroy();
    }
});
