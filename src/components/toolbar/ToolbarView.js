import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';
import { helpers } from 'utils';
import ToolbarItemsCollection from './collections/ToolbarItemsCollection';
import VirtualCollection from '../../collections/VirtualCollection';
import meta from './meta';
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

const getDefaultOptions = options => ({
    mode: 'Normal', // 'Mobile'
    showName: options.mode !== 'Mobile',
    class: ''
});

export default Marionette.View.extend({
    initialize() {
        helpers.ensureOption(this.options, 'toolbarItems');
        _.defaults(this.options, getDefaultOptions(this.options));

        const optionsToolbarCollection = this.options.toolbarItems;
        const toolbarCollection =
            optionsToolbarCollection instanceof Backbone.Collection
                ? (() => {
                      // this case is deprecated. Instead, pass an array and use getToolbarItems to access the toolbar items collection.
                      optionsToolbarCollection.model = ToolbarItemsCollection.prototype.model;
                      optionsToolbarCollection.reset(optionsToolbarCollection.toJSON());
                      return optionsToolbarCollection;
                  })()
                : new ToolbarItemsCollection(optionsToolbarCollection);

        const allItems = new VirtualCollection(toolbarCollection);
        const groupsSortOptions = { kindConst: meta.kinds.CONST, constGroupName: groupNames.const, mainGroupName: groupNames.main };

        this.groupedCollection = new GroupedCollection({
            allItems,
            class: ToolbarItemsCollection,
            groups: Object.values(groupNames),
            groupsSortOptions
        });

        this.mainActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.main]);
        this.constActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.const]);
        this.popupMenuView = this.__createDropdownActionsView(this.groupedCollection.groups[groupNames.menu]);

        this.listenTo(optionsToolbarCollection, 'change add remove reset update', this.debounceRebuildShort);
    },

    className() {
        return `${this.options.class || ''} js-toolbar-actions toolbar-container`;
    },

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
        const debounceRebuildView = _.debounce(() => this.rebuildView(), debounceInterval.short);
        this.listenTo(Core.services.GlobalEventService, 'window:load window:resize', () => {
            const interval = setInterval(() => {
                if (debounceRebuildView()) {
                    clearInterval(interval);
                }
                //TODO: move menu dropdown on resize
            }, debounceInterval.medium);
        });
    },

    getToolbarItems() {
        return this.groupedCollection.allItems;
    },

    __createActionsGroupsView(collection) {
        const view = new CustomActionGroupView({
            collection,
            reqres: this.options.reqres,
            mode: this.options.mode,
            showName: this.options.showName
        });
        this.listenTo(view, 'command:execute', (model, options = {}) => this.trigger('command:execute', model, options));
        return view;
    },

    __resetCollections() {
        this.groupedCollection.reset();
        this.rebuildView();
    },

    rebuildView() {
        if (this.isDestroyed() || document.readyState !== 'complete') {
            return false;
        }

        const mainGroupModels = this.groupedCollection.getModels(groupNames.main);

        if (mainGroupModels.length === 0) {
            return false;
        }

        const menuCollection = this.groupedCollection.groups[groupNames.menu];
        const toolbarElementsItems = [...this.getRegion('toolbarItemsRegion').el.firstElementChild.children];
        const indexOfNotFitItem = toolbarElementsItems.map(el => el.getBoundingClientRect().top).findIndex((topCoord, i, array) => i > 0 && topCoord > array[i - 1]);
        const menuModels = indexOfNotFitItem > -1 ? this.groupedCollection.groups[groupNames.main].slice(indexOfNotFitItem) : [];

        // TODO: from now, groupedCollection class doesn't make sence anymore and can be removed
        menuCollection.reset(menuModels);

        return true;
    },

    __createDropdownActionsView() {
        const GroupView = meta.viewsByType[meta.toolbarItemType.GROUP];
        const view = new GroupView({
            model: new Backbone.Model({
            items: this.groupedCollection.groups[groupNames.menu],
            }),
            customAnchor: actionsMenuLabel
        });

        this.listenTo(view, 'action:click', this.__executeDropdownCommand);
        return view;
    },

    __executeDropdownCommand(model, options = {}) {
        this.trigger('command:execute', model, options);
    }
});
