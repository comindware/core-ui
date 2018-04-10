//@flow
import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';

const actionsMenuLabel = '⋮';
const menuActionsWidth = 30;
const itemMarginLeft = 10;

export default Marionette.LayoutView.extend({
    initialize() {
        this.allItemsCollection = this.options.allItemsCollection;
        this.toolbarItemsCollection = new Backbone.Collection(this.allItemsCollection.models);
        this.menuItemsCollection = new Backbone.Collection();

        this.toolbarActions = this.__createActionsGroupsView();
        this.popupMenu = this.__createDropdownActionsView(this.menuItemsCollection);
        this.listenTo(this.toolbarActions, 'actionSelected', action => this.trigger('command:execute', action));
        this.listenTo(this.popupMenu, 'execute', (action, model) => this.trigger('command:execute', model));
        this.listenTo(Core.services.GlobalEventService, 'window:resize', this.rebuildView);
        this.listenTo(this.allItemsCollection, 'change reset', this.rebuildView);
    },

    className: 'js-toolbar-actions toolbar-container',

    template: Handlebars.compile(template),

    regions: {
        toolbarItemsRegion: '.js-toolbar-items',
        popupMenuRegion: '.js-menu-actions-region'
    },

    onAttach() {
        this.rebuildView();
    },

    onRender() {
        this.toolbarItemsRegion.show(this.toolbarActions);
        this.popupMenuRegion.show(this.popupMenu);
        this.popupMenuRegion.$el.hide();
    },

    __createActionsGroupsView() {
        return new CustomActionGroupView({
            collection: this.toolbarItemsCollection
        });
    },

    rebuildView() {
        this.toolbarItemsCollection.reset(this.allItemsCollection.models);
        const toolbarActions = this.toolbarItemsRegion.$el.children().children();
        if (toolbarActions.length === 0) {
            return;
        }
        const toolbarWidth = this.$el.width();
        let childWidth = 0;
        let findingItem = -1;
        toolbarActions.each((i, val) => {
            childWidth += val.getBoundingClientRect().width + itemMarginLeft;
            if (childWidth + menuActionsWidth > toolbarWidth) {
                findingItem = i;
                return false;
            }
        });

        if (findingItem >= 0) {
            this.popupMenuRegion.$el.show();
            this.menuItemsCollection.reset(this.allItemsCollection.slice(findingItem));
            this.toolbarItemsCollection.reset(this.allItemsCollection.slice(0, findingItem));
        } else {
            this.popupMenuRegion.$el.hide();
        }
    },

    __createDropdownActionsView() {
        return Core.dropdown.factory.createDropdown({
            text: actionsMenuLabel,
            items: this.menuItemsCollection
        });
    }
});
