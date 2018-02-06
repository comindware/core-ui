
import SeverityPanelChildView from './ActionPanelChildView';

export default Marionette.CollectionView.extend({
    className: 'toolbar-panel_container',

    template: false,

    childView: SeverityPanelChildView,

    childEvents: {
        'click:item': '__triggerChildSelect'
    },

    __triggerChildSelect(model) {
        this.trigger('click:item', model);
    }
});
