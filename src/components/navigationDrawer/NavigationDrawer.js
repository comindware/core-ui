import GroupItemView from './views/DrawerItemView';
import GroupsCollection from './collections/GroupsCollection';
import template from './templates/navigationDrawer.html';

export default Marionette.CompositeView.extend({
    initialize(options) {
        this.collection = new GroupsCollection(options.collection);
        this.collapsed = options.collapsed;
        this.absolute = options.isAbsolute;
    },

    template: Handlebars.compile(template),

    ui: {
        titleContainer: '.js-drawer-title',
        collapseButton: '.js-drawer-collapse'
    },

    events: {
        'click @ui.collapseButton': '__toggleCollapse'
    },

    className() {
        return `navigationDrawer__ul ${this.options.isAbsolute ? 'navigationDrawer_absolute' : ''}`;
    },

    templateHelpers() {
        return {
            title: this.options.title
        };
    },

    childView: GroupItemView,

    childViewContainer: '.js-children-container',

    onRender() {
        this.__updatePanelStyle();
    },

    __toggleCollapse() {
        this.collapsed = !this.collapsed;
        this.__updatePanelStyle();
        this.__updateTitleStyle();
    },

    __updatePanelStyle() {
        this.absolute ? this.$el.find('.js-children-container').css({ left: this.collapsed ? -250 : 0 }) : this.$el.width(this.collapsed ? 40 : 250);
    },

    __updateTitleStyle() {
        this.collapsed ? this.ui.titleContainer.hide() : this.ui.titleContainer.show();
    }
});
