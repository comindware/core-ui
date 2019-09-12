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

        const optionsToolbarCollection = this.options.allItemsCollection;
        let allItems;
        if (optionsToolbarCollection instanceof Backbone.Collection) {
            Core.InterfaceError.logError(
                'Pass collection for toolbar is deprecated. Instead, pass an array and use getToolbarItems to access the toolbar items collection.'
            );
            optionsToolbarCollection.model = ToolbarItemsCollection.prototype.model;
            optionsToolbarCollection.reset(optionsToolbarCollection.toJSON());
            allItems = optionsToolbarCollection;
        } else {
            allItems = new ToolbarItemsCollection(optionsToolbarCollection);
        }

        allItems = new VirtualCollection(allItems);

        const groupsSortOptions = { kindConst: meta.kinds.CONST, groupNames };

        this.groupedCollection = new GroupedCollection({
            allItems,
            class: ToolbarItemsCollection,
            groups: Object.values(groupNames),
            groupsSortOptions
        });

        this.mainActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.main]);
        this.constActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.const]);
        this.popupMenuView = this.__createDropdownActionsView(this.groupedCollection.groups[groupNames.menu]);

        this.listenTo(allItems, 'change reset update filter', _.debounce(this.__resetCollections, debounceInterval.short));
    },

    className: 'js-toolbar-actions toolbar-container',

    template: Handlebars.compile(template),

    regions: {
        toolbarItemsRegion: '.js-toolbar-items',
        popupMenuRegion: '.js-menu-actions-region',
        toolbarConstItemsRegion: '.js-toolbar-const-items'
    },

    ui: {
        toolbarItemsRegion: '.js-toolbar-items',
        popupMenuRegion: '.js-menu-actions-region',
        toolbarConstItemsRegion: '.js-toolbar-const-items'
    },

    onRender() {
        this.showChildView('toolbarItemsRegion', this.mainActionsView);
        this.showChildView('popupMenuRegion', this.popupMenuView);
        this.showChildView('toolbarConstItemsRegion', this.constActionsView);
        const popupMenuRegionElementStyle = this.getRegion('popupMenuRegion').el.style;
        popupMenuRegionElementStyle.visibility = 'hidden';
        const menuItems = this.groupedCollection.groups[groupNames.menu];
        this.listenTo(menuItems, 'reset update', () => {
            if (menuItems.length) {
                popupMenuRegionElementStyle.visibility = 'visible';
            } else {
                popupMenuRegionElementStyle.visibility = 'hidden';
            }
        });
    },

    onAttach() {
        this.__resetCollections();
        const debouncedRebuild = _.debounce(() => {
            const interval = setInterval(() => this.rebuildView(interval), debounceInterval.medium);
        }, debounceInterval.medium);
        //TODO: move menu dropdown on resize
        this.listenTo(Core.services.GlobalEventService, 'window:load window:resize', debouncedRebuild);
    },

    getToolbarItems() {
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
        this.groupedCollection.reset();
        this.rebuildView();
    },

    rebuildView(interval) {
        if (this.isDestroyed()) {
            clearInterval(interval);
            return;
        }
        if (document.readyState !== 'complete') {
            return;
        }

        const allCollapsibleModels = this.groupedCollection.getCollapsibleModels();

        if (allCollapsibleModels.length === 0) {
            return;
        }

        const mainCollection = this.groupedCollection.groups[groupNames.main];
        const menuCollection = this.groupedCollection.groups[groupNames.menu];

        mainCollection.reset(allCollapsibleModels);
        menuCollection.reset();

        const toolbarElementsItems = [...this.ui.toolbarItemsRegion.get(0).querySelector('.js-toolbar-items-container').children];
        const maxRight = this.ui.toolbarConstItemsRegion.get(0).getBoundingClientRect().left - this.ui.popupMenuRegion.get(0).getBoundingClientRect().width;
        const indexOfNotFitItem = toolbarElementsItems.findIndex(btn => btn.getBoundingClientRect().right > maxRight);

        if (indexOfNotFitItem > -1) {
            const sliceIndex = indexOfNotFitItem;

            mainCollection.reset(allCollapsibleModels.slice(0, sliceIndex));
            menuCollection.reset(allCollapsibleModels.slice(sliceIndex));
        }

        clearInterval(interval);
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
