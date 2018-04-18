import OptionItemView from './OptionItemView';

export default Marionette.CollectionView.extend({
    childView: OptionItemView,

    childViewEvents: {
        execute: '__execute'
    },

    __execute(view, data) {
        this.options.parent.close();
        this.options.parent.trigger('execute', data.model.id, data.model);
    }
});
