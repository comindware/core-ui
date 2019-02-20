//@flow
import meta from '../../meta';

export default Marionette.CollectionView.extend({
    className() {
        return `toolbar-panel_container ${this.options.class || ''}`;
    },

    template: _.noop,

    childView(model) {
        return meta.getViewByModel(model).extend({
            triggers: {
                click: 'click:item'
            }
        });
    },

    childViewEvents: {
        'click:item': '__triggerChildSelect'
    },

    __triggerChildSelect(view) {
        if (view.model.get('type') === meta.toolbarItemType.HEADLINE) {
            return;
        }
        this.trigger('click:item', view.model);
    }
});
