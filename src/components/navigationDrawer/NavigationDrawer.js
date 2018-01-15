
import GroupItemView from './views/GroupItemView';
import GroupsCollection from './collections/GroupsCollection';
import template from './templates/navigationDrawer.html';

export default Marionette.CompositeView.extend({
    initialize(options) {
        this.collection = new GroupsCollection(options.collection);
        this.collapsed = options.collapsed;
    },

    tagName: 'ul',

    template: Handlebars.compile(template),

    ui: {
        collapseButton: '.js-drawer-collapse'
    },

    events: {
        'click @ui.collapseButton': '__toggleCollapse',
    },

    className: 'navigationDrawer__ul',

    childView: GroupItemView,

    onRender() {
        this.$el.width(this.collapsed ? 40 : 250);
    },

    __toggleCollapse() {
        this.collapsed = !this.collapsed;
        this.$el.width(this.collapsed ? 40 : 250);
    }
});
