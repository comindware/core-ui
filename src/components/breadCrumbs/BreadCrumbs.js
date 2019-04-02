//@flow
import CrumbTextView from './views/CrumbTextView';
import GroupsCollection from './collections/GroupsCollection';
import template from './templates/navigationDrawer.html';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.collection = new GroupsCollection(options.collection);
        this.collapsed = options.collapsed;
        this.absolute = options.isAbsolute;
    },

    template: Handlebars.compile(template),

    ui: {
        collapseButton: '.js-drawer-collapse'
    },

    events: {
        'pointerdown @ui.collapseButton': '__toggleCollapse'
    },

    className: 'breadCrumbs',

    childViewContainer: '.js-children-container',

    childView: CrumbTextView
});
