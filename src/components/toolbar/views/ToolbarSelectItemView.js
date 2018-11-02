import ToolbarCheckboxItemView from './ToolbarCheckboxItemView';

export default ToolbarCheckboxItemView.extend({
    modelEvents: {
        'selected deselected': '__updateState'
    },

    onRender() {
        this.__updateState();
    },

    __updateState() {
        this.ui.check.toggleClass(this.classes.CHECKED, !!this.model.selected);
    },

    __handleClick() {
        this.model.select();
        this.__updateState();
        this.trigger('action:click', this.model);
    }
});
