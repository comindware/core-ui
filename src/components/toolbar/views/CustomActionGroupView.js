//@flow
import meta from '../meta';

export default Marionette.CollectionView.extend({
    className: 'toolbar-items-wrp',

    viewComparator: 'order',

    childView(model) {
        return meta.getViewByModel(model);
    },

    childViewOptions() {
        return {
            reqres: this.getOption('reqres'),
            mode: this.options.mode,
            showName: this.options.showName,
            isPopup: this.options.isPopup
        };
    },

    childViewEvents: {
        'action:click': '__handleCommand',
        search(searchString, { model }) {
            return this.__handleCommand(model, { searchString });
        }
    },

    __handleCommand(model, options) {
        if (model.get('type') === meta.toolbarItemType.HEADLINE) {
            return;
        }
        this.trigger('command:execute', model, options);
    }
});
