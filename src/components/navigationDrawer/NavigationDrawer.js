//@flow
import GroupItemView from './views/DrawerItemView';
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
        titleContainer: '.js-drawer-title',
        collapseButton: '.js-drawer-collapse',
        resizer: '.js-resizer'
    },

    events: {
        'pointerdown @ui.collapseButton': '__toggleCollapse'
    },

    tagName: 'nav',

    className() {
        return `navigationDrawer__ul ${this.options.isAbsolute ? 'navigationDrawer_absolute' : ''}`;
    },

    templateContext() {
        return {
            title: this.options.title
        };
    },

    childView: GroupItemView,

    childViewContainer: '.js-children-container',

    onRender() {
        this.__updatePanelStyle();
        Core.services.UIService.draggable({
            el: this.ui.resizer[0],
            axis: 'x',
            drag: this.__onDrag.bind(this),
            start: this.__onDragStart.bind(this),
            stop: this.__onDragStop.bind(this),
            setProperties: []
        });
    },

    __onDragStart() {
        this.el.style.transition = 'unset';
    },

    __onDragStop() {
        this.el.style.transition = '';
    },

    __onDrag(event, { position: { left } }) {
        if (left < 240) {
            return;
        }
        this.el.style.width = `${left}px`;
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
