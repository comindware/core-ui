import { helpers } from 'utils';
import dropdown from 'dropdown';
import HeaderMenuButtonView from './HeaderMenuButtonView';
import HeaderMenuPanelView from './HeaderMenuPanelView';
import template from './templates/tabHeader.hbs';
import TabHeadersView from './TabHeadersView';

const defaultOptions = {
    headerClass: ''
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'collection');
        _.defaults(options, defaultOptions);
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
        this.stopListening();
        const tabHeadersView = new TabHeadersView({
            collection: this.options.collection
        });
        this.listenTo(tabHeadersView, 'select', (model: Backbone.Model) => this.trigger('select', model));
        this.showChildView('tabsHeaderRegion', tabHeadersView);

        const menuView = dropdown.factory.createMenu({
            buttonView: HeaderMenuButtonView,
            panelView: HeaderMenuPanelView, 
            items: this.options.collection,
            showDropdownAnchor: false
        });
        this.listenTo(menuView, 'execute', this.__onMenuElexute);
        this.showChildView('menuButtonRegion', menuView);
    },

    __onMenuElexute(id: string, model: Backbone.Model) {
        this.trigger('select', model);
    },
});
