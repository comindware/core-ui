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

        const optionsAllItemsCollection = this.options.allItemsCollection;
        const allItemsCollection = optionsAllItemsCollection instanceof Backbone.Collection ? optionsAllItemsCollection : new ToolbarItemsCollection(optionsAllItemsCollection);
        const allItems = (this.allItemsCollection = new VirtualCollection(allItemsCollection));

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

        this.listenTo(allItems, 'change reset update filter', _.debounce(this.__resetCollections, debounceInterval.short));
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
        this.groupedCollection.reset();
        this.rebuildView();
    },

    rebuildView() {
        if (this.isDestroyed() || document.readyState !== 'complete') {
            return false;
        }

        const toolbarItemsRegion = this.getRegion('toolbarItemsRegion');

        this.groupedCollection.move(this.groupedCollection.getModels(groupNames.menu), groupNames.main);

        const mainGroupModels = this.groupedCollection.getModels(groupNames.main);
        if (mainGroupModels.length === 0) {
            return false;
        }

        const container = toolbarItemsRegion.el.querySelector('.js-icon-container');

        const outerWidth = el => {
            let width = el.offsetWidth;
            const style = getComputedStyle(el);

            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            return width;
        };

        let widthAggregator = 0;
        const containerOffsetWidth = container.offsetWidth;
        const notFitItemIndex = Array.from(container.childNodes).findIndex(el => {
            widthAggregator += outerWidth(el);
            return containerOffsetWidth < widthAggregator;
        });

        if (notFitItemIndex >= 0) {
            this.groupedCollection.move(mainGroupModels.slice(notFitItemIndex), groupNames.menu);
        }

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
