//@flow
import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';
import { helpers } from 'utils';
import ToolbarItemsCollection from './collections/ToolbarItemsCollection';
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
    short: 5
};

export default Marionette.View.extend({
    initialize() {
        helpers.ensureOption(this.options, 'allItemsCollection');

        const allItems = this.options.allItemsCollection;
        this.groupedCollection = new GroupedCollection({ allItems, class: ToolbarItemsCollection, groups: Object.values(groupNames) });
        this.mainActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.main]);
        this.constActionsView = this.__createActionsGroupsView(this.groupedCollection.groups[groupNames.const]);
        this.popupMenuView = this.__createDropdownActionsView(this.groupedCollection.groups[groupNames.menu]);

        this.debounceReset = _.debounce(this.__resetCollections, debounceInterval.short);
        this.listenTo(this.groupedCollection.allItems, 'change reset update', this.debounceReset);
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
        this.debounceReset();
        this.listenTo(Core.services.GlobalEventService, 'window:load window:resize', () => {
            const interval = setInterval(() => {
                if (document.readyState === 'complete') {
                    clearTimeout(interval);
                    _.debounce(this.rebuildView(), debounceInterval.long);
                }
            }, 100);
        });
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
        const mainItems = this.groupedCollection.getModels('all').filter(model => model.get('kind') !== meta.kinds.CONST);
        this.groupedCollection.reset(mainItems, groupNames.main);

        const constItems = this.groupedCollection.getModels('all').filter(model => model.get('kind') === meta.kinds.CONST);
        this.groupedCollection.reset(constItems, groupNames.const);
        if (document.readyState === 'complete') {
            this.rebuildView();
        }
    },

    rebuildView() {
        if (this.isDestroyed()) {
            return;
        }

        const mainItems = this.groupedCollection.getModels(groupNames.main);
        const menuItems = this.groupedCollection.getModels(groupNames.menu);

        if (mainItems.length + menuItems.length === 0) {
            return;
        }

        this.groupedCollection.ungroup(mainItems);
        this.groupedCollection.ungroup(menuItems);
        const ungroupedModels = this.groupedCollection.getModels();

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
