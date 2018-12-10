//@flow
import CustomActionGroupView from './views/CustomActionGroupView';
import template from './templates/toolbarView.html';
import { helpers } from 'utils';
import ToolbarItemsCollection from './collections/ToolbarItemsCollection';
import meta from './meta';

const actionsMenuLabel = '⋮';

export default Marionette.View.extend({
    initialize() {
        helpers.ensureOption(this.options, 'allItemsCollection');

        this.allItemsCollection = this.options.allItemsCollection;
        this.toolbarItemsCollection = new ToolbarItemsCollection();
        this.menuItemsCollection = new ToolbarItemsCollection();
        this.toolbarConstItemsCollection = new ToolbarItemsCollection();
        this.__resetCollections();

        this.toolbarActions = this.__createActionsGroupsView(this.toolbarItemsCollection);
        this.constToolbarActions = this.__createActionsGroupsView(this.toolbarConstItemsCollection);
        this.popupMenu = this.__createDropdownActionsView(this.menuItemsCollection);

        this.debounceRebuildLong = _.debounce(this.rebuildView, 300);
        this.debounceRebuildShort = _.debounce(this.rebuildView, 5);
        this.listenTo(Core.services.GlobalEventService, 'window:resize window:load', this.debounceRebuildLong);
        this.listenTo(this.allItemsCollection, 'change add remove reset update', this.debounceRebuildShort);
    },

    className: 'js-toolbar-actions toolbar-container',

    template: Handlebars.compile(template),

    regions: {
        toolbarItemsRegion: '.js-toolbar-items',
        popupMenuRegion: '.js-menu-actions-region',
        toolbarConstItemsRegion: '.js-toolbar-const-items'
    },

    onAttach() {
        this.debounceRebuildShort();
    },

    onRender() {
        this.showChildView('toolbarItemsRegion', this.toolbarActions);
        this.showChildView('popupMenuRegion', this.popupMenu);
        this.showChildView('toolbarConstItemsRegion', this.constToolbarActions);
        this.getRegion('popupMenuRegion').$el.hide();
    },

    __createActionsGroupsView(collection) {
        const view = new CustomActionGroupView({
            collection,
            reqres: this.options.reqres
        });
        this.listenTo(view, 'actionSelected', (model, options = {}) => this.trigger('command:execute', model, options));
        return view;
    },

    rebuildView() {
        if (this.isDestroyed()) {
            return false;
        }

        this.__resetCollections();
        const toolbarActions = this.getRegion('toolbarItemsRegion')
            .$el.children()
            .children();
        if (toolbarActions.length === 0) {
            return;
        }
        let toolbarWidth = this.$el.width();
        const constItemsEl = this.getRegion('toolbarConstItemsRegion').$el;
        constItemsEl.length && (toolbarWidth -= constItemsEl.outerWidth());
        const menuActionsWidth = this.getRegion('popupMenuRegion').$el.outerWidth();

        let childWidth = 0;
        let notFitItem = -1;
        toolbarActions.each((i, val) => {
            childWidth += val.offsetWidth;
            if (childWidth + menuActionsWidth > toolbarWidth) {
                if (i === toolbarActions.length - 1) {
                    if (childWidth < toolbarWidth) {
                        return;
                    }
                }
                notFitItem = i;
                return false;
            }
        });

        if (notFitItem >= 0) {
            this.getRegion('popupMenuRegion').$el.show();
            this.menuItemsCollection.reset(this.toolbarItemsCollection.models.slice(notFitItem));
            this.toolbarItemsCollection.reset(this.toolbarItemsCollection.models.slice(0, notFitItem));
        } else {
            this.getRegion('popupMenuRegion').$el.hide();
        }
    },

    __resetCollections() {
        const rawCollection = this.allItemsCollection.toJSON();
        this.toolbarItemsCollection.reset(rawCollection.filter(model => model.kind !== meta.kinds.CONST));
        this.menuItemsCollection.reset();
        this.toolbarConstItemsCollection.reset(rawCollection.filter(model => model.kind === meta.kinds.CONST));
    },

    __createDropdownActionsView() {
        const view = Core.dropdown.factory.createMenu({
            text: actionsMenuLabel,
            items: this.menuItemsCollection,
            popoutFlow: 'right',
            customAnchor: true
        });

        this.listenTo(view, 'execute', this.__executeDropdownCommand);
        return view;
    },

    __executeDropdownCommand(action, model, options = {}) {
        if (model.get('type') !== meta.toolbarItemType.SPLITTER) {
            if (model.get('type') === meta.toolbarItemType.CHECKBOX) {
                model.toggleChecked && model.toggleChecked();
            }
            this.trigger('command:execute', model, options);
        }
    }
});
