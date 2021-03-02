import template from './group.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import MenuButtonView from './MenuButtonView';

const defaultOptions = ({ view }) => ({
    collapsed: false,
    collapsible: Boolean(view)
});

const classes = {
    CLASS_NAME: 'layout-group',
    COLLAPSED_CLASS: 'group-collapsed',
    MENU_SHOWN: 'layout-group__head_menu-shown'
};

const menuItemsIds = {
    maximize: 'maximize',
    restore: 'restore'
};

export default Marionette.View.extend({
    initialize(options) {
        _.defaults(options, defaultOptions(options));
        this.model = new Backbone.Model(options);
        this.listenTo(this.model, 'change:collapsed', this.__onCollapsedChange);

        this.update = this.update.bind(this);
    },

    template: Handlebars.compile(template),

    className: classes.CLASS_NAME,

    regions: {
        containerRegion: '.js-container-region',
        menuRegion: '.js-menu-region'
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    ui: {
        toggleCollapseButtons: '.js-toggle',
        header: '.js-header',
        containerRegion: '.js-container-region',
        menuRegion: '.js-menu-region'
    },

    events: {
        'click @ui.toggleCollapseButtons': 'onClickToggleButton',
        'click @ui.menuRegion': 'onMenuClick'
    },

    modelEvents: {
        'change:isMaximized': '__onMaximizedChange'
    },

    onRender() {
        const view = this.model.get('view');
        if (view) {
            this.showChildView('containerRegion', view);
        } else {
            this.ui.containerRegion[0].setAttribute('hidden', '');
        }
        this.__updateState();
        this.__onCollapsedChange();
        // TODO: toolbar?
        if (this.options.showMenu) {
            this.__createMenu();
            this.showChildView('menuRegion', this.menu);
        }
    },

    update() {
        const view = this.model.get('view');
        if (view?.update) {
            view.update();
        }
        this.__updateState();
    },

    validate() {
        const view = this.model.get('view');
        if (view?.validate) {
            return view.validate();
        }
    },

    onClickToggleButton(e) {
        if (this.ui.toggleCollapseButtons.get(0) === e.currentTarget) {
            this.toggleCollapse();
        }
    },

    toggleCollapse(collapse = !this.model.get('collapsed')) {
        if (!this.model.get('collapsible')) {
            return;
        }
        this.model.set('collapsed', collapse);
    },

    __onCollapsedChange(model = this.model, collapsed = this.model.get('collapsed')) {
        this.ui.toggleCollapseButtons.toggleClass(classes.COLLAPSED_CLASS, Boolean(collapsed));
        if (collapsed) {
            this.ui.containerRegion.slideUp(200);
        } else {
            this.ui.containerRegion.slideDown(200);
        }
    },

    __onMaximizedChange() {
        this.menuItemsCollection.reset(this.__getMenuItems());
    },

    __createMenu() {
        this.menuItemsCollection = new Backbone.Collection(this.__getMenuItems());
        this.menu = Core.dropdown.factory.createMenu({
            buttonView: MenuButtonView,
            items: this.menuItemsCollection,
            showDropdownAnchor: false,
            popoutFlow: 'right'
        });
        this.listenTo(this.menu, 'open', () => this.ui.header.addClass(classes.MENU_SHOWN));
        this.listenTo(this.menu, 'close', () => this.ui.header.removeClass(classes.MENU_SHOWN));
        this.listenTo(this.menu, 'execute', this.__execute);
    },

    __getMenuItems() {
        const items = [];
        if (this.model.get('isMaximized')) {
            items.push({
                id: menuItemsIds.restore,
                icon: 'window-restore',
                name: Localizer.get('CORE.LAYOUT.GROUPLAYOUT.MENU.RESTORE')
            });
        } else {
            items.push({
                id: menuItemsIds.maximize,
                icon: 'window-maximize',
                name: Localizer.get('CORE.LAYOUT.GROUPLAYOUT.MENU.MAXIMIZE')
            });
        }

        return items;
    },

    __execute(id) {
        switch (id) {
            case menuItemsIds.maximize:
                this.__onMaximize();
                break;
            case menuItemsIds.restore:
                this.__onRestore();
                break;
            default:
                break;
        }
    },

    onMenuClick() {
        return false;
    },

    __onRestore() {
        Core.services.WindowService.closeElPopup(this.modalCollectionViewId, true);
    },

    __onMaximize() {
        this.modalCollectionViewId = Core.services.WindowService.showElInPopup(this.$el);
        this.listenTo(Core.services.WindowService, 'popup:close', this.__onPopupClosing);
        this.model.set('isMaximized', true);
    },

    __onPopupClosing(closedPopupId) {
        if (closedPopupId === this.modalCollectionViewId) {
            this.stopListening(Core.services.WindowService, 'popup:close', this.__onPopupClosing);
            delete this.modalCollectionViewId;
            this.model.set('isMaximized', false);
        }
    },
});
