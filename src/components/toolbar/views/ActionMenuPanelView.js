//@flow
import ActionPanelChildView from './ActionPanelChildView';

export default Marionette.CollectionView.extend({
    className() {
        return `toolbar-panel_container ${this.options.class || ''}`;
    },

    childView: ActionPanelChildView,

    childViewEvents: {
        'click:item': '__triggerChildSelect'
    },

    __triggerChildSelect(model) {
        this.trigger('click:item', model);
    }
});
