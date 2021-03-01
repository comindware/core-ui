import ToolbarCheckboxItemView from './ToolbarCheckboxItemView';

export default ToolbarCheckboxItemView.extend({
    modelEvents: {
        'selected deselected': '__updateState'
    },

    onRender() {
        this.__toggleIcon(!!this.model.selected);
    },

    __handleClick() {
        this.model.select();
        this.__toggleIcon(!!this.model.selected);
        this.trigger('action:click', this.model);
    }
});
