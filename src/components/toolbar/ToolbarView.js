//@flow
import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';

const actionsMenuLabel = '⋮';
const menuActionsWidth = 30;
const itemMarginLeft = 10;

export default Marionette.View.extend({
    initialize() {
        this.allItemsCollection = this.options.allItemsCollection;
        this.toolbarItemsCollection = new Backbone.Collection(this.allItemsCollection.models);
        this.menuItemsCollection = new Backbone.Collection();

        this.toolbarActions = this.__createActionsGroupsView();
        this.popupMenu = this.__createDropdownActionsView(this.menuItemsCollection);
        this.listenTo(this.toolbarActions, 'actionSelected', action => this.trigger('command:execute', action));
        this.listenTo(this.popupMenu, 'execute', (action, model) => this.trigger('command:execute', model));
        const debounceRebuild = _.debounce(() => this.rebuildView(), 100);
        this.listenTo(Core.services.GlobalEventService, 'window:resize', debounceRebuild);
        this.listenTo(this.allItemsCollection, 'change add remove reset update', debounceRebuild);
    },

    className: 'js-toolbar-actions toolbar-container',

    template: Handlebars.compile(template),

    regions: {
        toolbarItemsRegion: '.js-toolbar-items',
        popupMenuRegion: '.js-menu-actions-region'
    },

    onRender() {
        this.showChildView('toolbarItemsRegion', this.toolbarActions);
        this.showChildView('popupMenuRegion', this.popupMenu);
        this.getRegion('popupMenuRegion').$el.hide();
    },

    onAttach() {
        this.rebuildView();
    },

    __createActionsGroupsView() {
        return new CustomActionGroupView({
            collection: this.toolbarItemsCollection,
            reqres: this.options.reqres
        });
    },

    rebuildView() {
        if (this.isDestroyed()) {
            return false;
        }
        this.toolbarItemsCollection.reset(this.allItemsCollection.models);
        const toolbarActions = this.getRegion('toolbarItemsRegion')
            .$el.children()
            .children();
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
            this.getRegion('popupMenuRegion').$el.show();
            this.menuItemsCollection.reset(this.allItemsCollection.slice(findingItem));
            this.toolbarItemsCollection.reset(this.allItemsCollection.slice(0, findingItem));
        } else {
            this.getRegion('popupMenuRegion').$el.hide();
        }
    },

    __createDropdownActionsView() {
        return Core.dropdown.factory.createMenu({
            text: actionsMenuLabel,
            items: this.menuItemsCollection,
            popoutFlow: 'right',
            customAnchor: true
        });
    }
});
