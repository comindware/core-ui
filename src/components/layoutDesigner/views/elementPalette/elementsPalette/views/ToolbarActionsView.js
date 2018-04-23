import ActionView from './ActionView';

export default Marionette.CollectionView.extend({
    className: 'ld-list-toolbar-btns',

    childView: ActionView,

    childEvents: {
        'action:clicked': '__handleActionClick'
    },

    __handleActionClick(event) {
        this.trigger('execute', event.model.id);
    }
});
