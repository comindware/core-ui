import DotView from './DotView';

export default Marionette.CollectionView.extend({
    className: 'carousel__dots',

    childView: DotView,

    updateActive(currentIndex: number) {
        this.children.forEach(child => child.updateActive(currentIndex));
    },

    childViewEvents: {
        select: '__onSelect'
    },

    __onSelect(childView) {
        this.trigger('select:page', childView.model.id);
    }
});
