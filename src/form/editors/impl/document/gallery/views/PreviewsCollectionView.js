import ImageView from './ImageView';

const ACTIVE_CLASS = 'active';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.collection = options.collection;
        this.listenTo(this.collection, 'select:one', model => this.__activateImage(model));
        this.listenTo(this.collection, 'deselect:one', model => this.__deActivateImage(model));
    },

    className: 'previews-collection-wrp',

    replaceElement: true,

    childView: ImageView,

    childViewOptions() {
        return {
            previewMode: true
        };
    },

    childViewEvents: {
        'item:click': '__onClick'
    },

    __onClick(view) {
        this.collection.select(view.model);
    },

    __activateImage(model) {
        this.children.findByModel(model).el.classList.add(ACTIVE_CLASS);
    },

    __deActivateImage(model) {
        this.children.findByModel(model).el.classList.remove(ACTIVE_CLASS);
    }
});
