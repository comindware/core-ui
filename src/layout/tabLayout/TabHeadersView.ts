import HeaderItemView from './HeaderItemView';

export default Marionette.CollectionView.extend({
    tagName: 'ul',

    childView: HeaderItemView,

    childViewEvents: {
        select(model: Backbone.Model) {
            this.trigger('select', model);
        }
    }
});
