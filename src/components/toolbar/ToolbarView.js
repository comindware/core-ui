//@flow
import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';

const actionsMenuLabel = '⋮';

export default Marionette.View.extend({
    initialize() {
        this.allItemsCollection = this.options.allItemsCollection || new Backbone.Collection();
        this.toolbarItemsCollection = new Backbone.Collection(this.allItemsCollection.models);
        this.menuItemsCollection = new Backbone.Collection();

        this.toolbarActions = this.__createActionsGroupsView();
        this.popupMenu = this.__createDropdownActionsView(this.menuItemsCollection);
        this.listenTo(this.toolbarActions, 'actionSelected', model => this.trigger('command:execute', model));
        this.listenTo(this.popupMenu, 'execute', (action, model) => this.trigger('command:execute', model));
        this.debounceRebuild = _.debounce(() => this.rebuildView(), 500);
        this.listenTo(Core.services.GlobalEventService, 'window:resize window:load', this.debounceRebuild);
        this.listenTo(this.allItemsCollection, 'change add remove reset update', this.debounceRebuild);

        this.onAttach = () => this.debounceRebuild();
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

    __createActionsGroupsView() {
        return new CustomActionGroupView({
            collection: this.toolbarItemsCollection,
            reqres: this.options.reqres
        });
    },

    rebuildView() {
        if (!Core.services.GlobalEventService.__pageLoaded) {
            return;
        }
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
        const menuActionsWidth = this.menuActionsWidth ? this.menuActionsWidth : this.menuActionsWidth = this.getRegion('popupMenuRegion').$el.width();
        let childWidth = 0;
        let notFitItem = -1;
        toolbarActions.each((i, val) => {
            childWidth += val.getBoundingClientRect().width;
            if (childWidth + menuActionsWidth > toolbarWidth) {
                if (i === toolbarActions.length - 1) {
                    if (childWidth < toolbarWidth) {
                        return;
                    }
                }
                notFitItem = i;
                return false; // break .each
            }
        });

        if (notFitItem >= 0) {
            this.getRegion('popupMenuRegion').$el.show();
            this.menuItemsCollection.reset(this.allItemsCollection.models.slice(notFitItem));
            this.toolbarItemsCollection.reset(this.allItemsCollection.models.slice(0, notFitItem));
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
