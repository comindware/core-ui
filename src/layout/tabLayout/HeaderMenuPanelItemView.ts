import MenuItemView from '../../dropdown/views/MenuItemView';

export default MenuItemView.extend({
    modelEvents: {
        'change:error change:enabled change:visible change:isHidden': '__applyClasses'
    },

    onRender() {
        MenuItemView.prototype.onRender.apply(this);
        this.__applyClasses();
    },

    __applyClasses() {
        this.$el.toggleClass('popout-menu__i_error', Boolean(this.model.get('error')));
        this.$el.toggleClass('popout-menu__i_disabled', !this.model.get('enabled'));
        this.$el.toggleClass('popout-menu__i_hidden', !this.model.isShow());
    }
});
