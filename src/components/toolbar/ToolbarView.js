import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';
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
    class: '',
    toolbarItems: []
});

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, getDefaultOptions(this.options));

        const optionsToolbarCollection = this.options.toolbarItems;
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

    className() {
        return `${this.options.class || ''} js-toolbar-actions toolbar-container`;
    },

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
        const menuItems = this.groupedCollection.groups[groupNames.menu];
        this.listenTo(menuItems, 'reset update', () => this.ui.popupMenuRegion.toggle(Boolean(menuItems.length)));
    },

    onAttach() {
        this.__resetCollections();
        const toolbar = this.el.parentElement;
        this.toolbarWidth = toolbar.offsetWidth;
        const debouncedRebuild = _.debounce(() => {
            const interval = setInterval(() => {
                if (!this.isDestroyed()) {
                    const currentToolbarWidth = toolbar.offsetWidth;
                    if (this.toolbarWidth === currentToolbarWidth) {
                        return;
                    }
                    this.toolbarWidth = currentToolbarWidth;
                    this.rebuildView(interval), debounceInterval.medium;
                }
            });
        }, debounceInterval.medium);
        if (this.el.parentElement) {
            const resizeObserver = new ResizeObserver(debouncedRebuild);
            resizeObserver.observe(this.el.parentElement);
        }
        this.listenTo(Core.services.GlobalEventService, 'window:load', debouncedRebuild);
    },

    getToolbarItems() {
        return this.groupedCollection.allItems;
    },

    getCustomItems() {
        return this.groupedCollection.allCollapsibleItems;
    },

    getConstItems() {
        return this.groupedCollection.groups[groupNames.const];
    },

    __createActionsGroupsView(collection) {
        const view = new CustomActionGroupView({
            collection,
            reqres: this.options.reqres,
            mode: this.options.mode,
            showName: this.options.showName
        });
        this.listenTo(view, 'command:execute', this.__executeCommand);
        return view;
    },

    __resetCollections() {
        this.groupedCollection.reset();
        this.rebuildView();
    },

    rebuildView(interval) {
        if (this.isDestroyed() || !this.isRendered()) {
            clearInterval(interval);
            return;
        }
        if (document.readyState !== 'complete') {
            return;
        }

        const allCollapsibleModels = this.groupedCollection.getCollapsibleModels();

        if (allCollapsibleModels.length === 0) {
            clearInterval(interval);
            return;
        }
        this.trigger('before:rebuild');

        const mainCollection = this.groupedCollection.groups[groupNames.main];
        const menuCollection = this.groupedCollection.groups[groupNames.menu];

        mainCollection.reset(allCollapsibleModels);
        menuCollection.reset();
        this.ui.popupMenuRegion.show();
        const toolbarElementsItems = [...this.getRegion('toolbarItemsRegion').el.firstElementChild.children];
        const maxRight = Math.round(this.ui.toolbarConstItemsRegion.get(0).getBoundingClientRect().left - this.ui.popupMenuRegion.get(0).getBoundingClientRect().width);
        const indexOfNotFitItem = toolbarElementsItems.findIndex(btn => {
            const currentRight = Math.round(btn.getBoundingClientRect().right);
            return currentRight > maxRight;
        });

        if (indexOfNotFitItem > -1) {
            const sliceIndex = indexOfNotFitItem;

            mainCollection.reset(allCollapsibleModels.slice(0, sliceIndex));
            menuCollection.reset(allCollapsibleModels.slice(sliceIndex));
        } else {
            this.ui.popupMenuRegion.hide();
        }

        this.trigger('rebuild');

        clearInterval(interval);
    },

    __createDropdownActionsView() {
        const GroupView = meta.viewsByType[meta.toolbarItemType.GROUP];
        const view = new GroupView({
            model: new Backbone.Model({
                items: this.groupedCollection.groups[groupNames.menu],
            }),
            mode: this.options.mode,
            showName: this.options.showName,
            customAnchor: actionsMenuLabel
        });

        this.listenTo(view, 'action:click', this.__executeCommand);
        return view;
    },

    __executeCommand(model, options = {}) {
        const handler = model.get('handler');
        if (typeof handler === 'function' && !this.options.skipActionHandlers) {
            handler(model, options);
            return;
        }
        this.trigger('command:execute', model, options);
    }
});
