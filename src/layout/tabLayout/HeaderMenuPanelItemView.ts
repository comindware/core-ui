import MenuItemView from '../../dropdown/views/MenuItemView';

export default MenuItemView.extend({
    onRender() {
        this.$el.toggleClass('popout-menu__i_error', Boolean(this.model.get('error')));
        this.$el.toggleClass('popout-menu__i_disabled', !this.model.get('enabled'));
        this.$el.toggleClass('popout-menu__i_hidden', !this.model.get('visible'));
    }
});