//@flow
import CrumbTextView from './views/CrumbTextView';
import GroupsCollection from './collections/GroupsCollection';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.collection = new GroupsCollection(options.collection);
        this.collapsed = options.collapsed;
        this.absolute = options.isAbsolute;
    },

    ui: {
        collapseButton: '.js-drawer-collapse'
    },

    events: {
        'click @ui.collapseButton': '__toggleCollapse'
    },

    className: 'breadCrumbs',

    childViewContainer: '.js-children-container',

    childView: CrumbTextView
});
