// @flow
import BubbleItemView from './BubbleItemView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.collection = options.collection;
    },

    className: 'bubbles__list',

    childView: BubbleItemView,

    childViewOptions() {
        return {
            reqres: this.reqres,
            parent: this.$el,
            enabled: this.options.datalistEnabled,
            createValueUrl: this.options.createValueUrl,
            showEditButton: this.options.showEditButton,
            showRemoveButton: this.options.canDeleteItem,
            getDisplayText: this.options.getDisplayText,
            customTemplate: this.options.customTemplate
        };
    },

    updateEnabled(enabled) {
        this.children.each(cv => {
            if (cv.updateEnabled) {
                cv.updateEnabled(enabled);
            }
        });
    }
});
