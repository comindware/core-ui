//@flow
import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';
import { helpers } from 'utils';
import ToolbarItemsCollection from './collections/ToolbarItemsCollection';
import VirtualCollection from '../../collections/VirtualCollection';
import meta from './meta';
import MenuPanelViewWithSplitter from './views/MenuPanelViewWithSplitter';
import GroupedCollection from './classes/GroupedCollection';

const actionsMenuLabel = '⋮';
const groupNames = {
    main: 'main',
    menu: 'menu',
    const: 'const'
};
const debounceInterval = {
    long: 300,
    medium: 100,
    short: 5
};

export default Marionette.View.extend({
    initialize() {
        helpers.ensureOption(this.options, 'allItemsCollection');

        let allItemsCollection = this.options.allItemsCollection;
        allItemsCollection = allItemsCollection instanceof Backbone.Collection ? allItemsCollection.toJSON() : allItemsCollection;
        this.groupedCollection = new GroupedCollection({
            allItems: new VirtualCollection(new ToolbarItemsCollection(allItemsCollection)),
            class: ToolbarItemsCollection,
            groups: Object.values(groupNames)
        });
        this.mainActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.main]);
        this.constActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.const]);
        this.popupMenuView = this.__createDropdownActionsView(this.groupedCollection.groups[groupNames.menu]);

        this.listenTo(this.groupedCollection.allItems, 'change reset update', _.debounce(this.__resetCollections, debounceInterval.short));
    },

    className: 'js-toolbar-actions toolbar-container',

    template: Handlebars.compile(template),

    regions: {
        toolbarItemsRegion: '.js-toolbar-items',
        popupMenuRegion: '.js-menu-actions-region',
        toolbarConstItemsRegion: '.js-toolbar-const-items'
    },

    onRender() {
        this.showChildView('toolbarItemsRegion', this.mainActionsView);
        this.showChildView('popupMenuRegion', this.popupMenuView);
        this.showChildView('toolbarConstItemsRegion', this.constActionsView);
        const popupMenuRegion = this.getRegion('popupMenuRegion');
        popupMenuRegion.$el.hide();
        const menuItems = this.groupedCollection.groups[groupNames.menu];
        this.listenTo(menuItems, 'reset update', () => {
            if (menuItems.length) {
                popupMenuRegion.$el.show();
            } else {
                popupMenuRegion.$el.hide();
            }
        });
    },

    onAttach() {
        this.__resetCollections();
        const debounceRebuildView = _.debounce(() => this.rebuildView(), debounceInterval.short);
        this.listenTo(Core.services.GlobalEventService, 'window:load window:resize', () => {
            const interval = setInterval(() => {
                if (debounceRebuildView()) {
                    clearInterval(interval);
                }
            }, debounceInterval.medium);
        });
    },

    getAllItemsCollection() {
        return this.groupedCollection.allItems;
    },

    __createActionsGroupsView(collection) {
        const view = new CustomActionGroupView({
            collection,
            reqres: this.options.reqres
        });
        this.listenTo(view, 'actionSelected', (model, options = {}) => this.trigger('command:execute', model, options));
        return view;
    },

    __resetCollections() {
        this.groupedCollection.getAllItemsModels().forEach(model => {
            this.groupedCollection.move(model, model.get('kind') === meta.kinds.CONST ? groupNames.const : groupNames.main);
        });
        this.rebuildView();
    },

    rebuildView() {
        if (this.isDestroyed() || document.readyState !== 'complete') {
            return false;
        }

        const ungroupedModels = this.groupedCollection.ungroup(groupNames.main, groupNames.menu);

        if (ungroupedModels.length === 0) {
            return false;
        }

        const toolbarItemsRegion = this.getRegion('toolbarItemsRegion');
        const constItemsEl = this.getRegion('toolbarConstItemsRegion').$el;
        const menuActionsWidth = this.getRegion('popupMenuRegion').$el.outerWidth();
        const toolbarWidth = this.$el.width() - constItemsEl.outerWidth() - menuActionsWidth;

        ungroupedModels.forEach(model => {
            if (toolbarItemsRegion.$el.width() < toolbarWidth) {
                this.groupedCollection.move(model, groupNames.main);
            } else {
                this.groupedCollection.move(model, groupNames.menu);
            }
        });

        return true;
    },

    __createDropdownActionsView() {
        const view = Core.dropdown.factory.createMenu({
            text: actionsMenuLabel,
            items: this.groupedCollection.groups[groupNames.menu],
            popoutFlow: 'right',
            customAnchor: true,
            panelView: MenuPanelViewWithSplitter
        });
        this.listenTo(view, 'execute', this.__executeDropdownCommand);
        return view;
    },

    __executeDropdownCommand(action, model, options = {}) {
        if (model.get('type') === meta.toolbarItemType.CHECKBOX) {
            model.toggleChecked && model.toggleChecked();
        }
        this.trigger('command:execute', model, options);
    }
});
