import { helpers } from 'utils';
import dropdown from 'dropdown';
import HeaderMenuButtonView from './HeaderMenuButtonView';
import HeaderMenuPanelView from './HeaderMenuPanelView';
import template from './templates/tabHeader.hbs';
import TabHeadersView from './TabHeadersView';

const defaultOptions = {
    headerClass: ''
};

const toggleMenuDelay = 150;

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'collection');
        _.defaults(options, defaultOptions);

        this.tabHeadersView = new TabHeadersView({
            collection: this.options.collection
        });
        this.listenTo(this.tabHeadersView, 'select', model => this.trigger('select', model));

        this.menuView = dropdown.factory.createMenu({
            buttonView: HeaderMenuButtonView,
            buttonViewOptions: {
                collection: this.options.collection
            },
            class: 'tab-header-view__menu-dropdown',
            panelView: HeaderMenuPanelView,
            items: this.options.collection,
            customAnchor: true
        });
        this.listenTo(this.menuView, 'execute', this.__onMenuEcexute);
    },

    template: Handlebars.compile(template),

    className() {
        return `layout__tab-layout__header-view ${this.getOption('headerClass') || ''}`;
    },

    regions: {
        menuButtonRegion: {
            el: '.js-menu-button-region',
            replaceElement: true
        },
        tabsHeaderRegion: {
            el: '.js-tabs-headers-region',
            replaceElement: true
        }
    },

    onRender() {
        this.showChildView('tabsHeaderRegion', this.tabHeadersView);
        this.showChildView('menuButtonRegion', this.menuView);
    },

    onAttach() {
        this.listenTo(Core.services.GlobalEventService, 'window:resize', _.debounce(this.__toggleMenu, toggleMenuDelay));
        this.listenTo(this.options.collection, 'change:visible change:isHidden', _.debounce(this.__toggleMenu, 0));

        this.__toggleMenu();
    },

    __toggleMenu() {
        if (!this.__isUiReady()) {
            return;
        }

        const isOverflow = this.tabHeadersView.el.scrollWidth > this.tabHeadersView.el.offsetWidth + this.menuView.el.offsetWidth;

        this.menuView.$el.toggle(isOverflow);
    },

    __onMenuEcexute(id, model) {
        if (model.get('enabled')) {
            this.trigger('select', this.model);
        }
    },

    __isUiReady() {
        return this.isRendered() && !this.isDestroyed() && this.isAttached();
    }
});
