import template from '../templates/popoutPanel.html';
import PopoutPanelView from './PopoutPanelView';
import PopoutPanelEmptyView from './PopoutPanelEmptyView';

export default Marionette.CollectionView.extend({
    initialize() {
        _.bindAll(this, '__onChildItemTitleSelect');

        this.collection = this.model.get('children');
    },

    classes: {
        itemTitleSelected: '.js-item-title-selected'
    },

    events: {
        'click .js-clear-value': '__onChildItemTitleSelectEmpty',
        mousewheel: '__handleMousewheel'
    },

    template: Handlebars.compile(template),

    className: 'data-source-popout-view',

    childView: PopoutPanelView,

    childViewContainer: '.js-popout-panel',

    emptyView: PopoutPanelEmptyView,

    childViewEvents: {
        'path:select': '__onChildItemTitleSelect',
        'item:toggle': '__onChildItemToggle'
    },

    onDomRefresh() {
        _.delay(() => {
            this.trigger('scrollTo', this.$el.find(this.classes.itemTitleSelected));
        }, 5);
    },

    __onChildItemTitleSelect(view, selected) {
        this.options.parent.trigger('element:path:select', selected);
    },

    __onChildItemTitleSelectEmpty() {
        this.options.parent.trigger('element:path:select', null);
    },

    __onChildItemToggle() {
        this.trigger('updateScroller');
        this.trigger('scrollToBottom');
    },

    __handleMousewheel(e) {
        this.el.scrollTop -= e.originalEvent.wheelDeltaY;
        e.preventDefault();
    }
});
