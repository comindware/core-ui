import HeaderItemView from './HeaderItemView';

export default Marionette.CollectionView.extend({
    tagName: 'ul',

    childView: HeaderItemView,

    childViewEvents: {
        select(model) {
            this.trigger('select', model);
        }
    }
});
