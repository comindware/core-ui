/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from './tabLayout.hbs';
import HeaderView from './HeaderView';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__tab-layout',
    PANEL_REGION: 'layout__tab-layout__panel-region'
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'tabs');

        this.__tabsCollection = options.tabs;
        if (!(this.__tabsCollection instanceof Backbone.Collection)) {
            this.__tabsCollection = new Backbone.Collection(this.__tabsCollection);
        }
        this.__tabsCollection.each(model => {
            if (model.get('enabled') === undefined) {
                model.set('enabled', true);
            }
        });
        const selectedTab = this.__findSelectedTab();
        if (!selectedTab) {
            this.selectTab(this.__tabsCollection.at(0).id);
        }

        this.listenTo(this.__tabsCollection, 'change:selected', this.__onSelectedChanged);

        this.tabs = options.tabs.reduce((s, a) => {
            s[a.id] = a.view;
            return s;
        }, {});
    },

    template: Handlebars.compile(template),

    className: classes.CLASS_NAME,

    regions: {
        headerRegion: '.js-header-region'
    },

    ui: {
        panelContainer: '.js-panel-container'
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onShow() {
        const headerView = new HeaderView({
            collection: this.__tabsCollection
        });
        this.listenTo(headerView, 'select', this.__handleSelect);
        this.headerRegion.show(headerView);

        this.__tabsCollection.each(tabModel => {
            const $regionEl = $('<div></div>').addClass(classes.PANEL_REGION);
            this.ui.panelContainer.append($regionEl);
            const region = this.addRegion(`${tabModel.id}TabRegion`, {
                el: $regionEl
            });
            region.show(tabModel.get('view'));
            tabModel.set({
                region,
                $regionEl
            });
            this.__updateTabRegion(tabModel);
        });
        this.__updateState();
    },

    update() {
        Object.values(this.tabs).forEach(view => {
            if (view.update) {
                view.update();
            }
        });
        this.__updateState();
    },

    getViewById(tabId) {
        return this.__findTab(tabId).get('view');
    },

    selectTab(tabId) {
        const tab = this.__findTab(tabId);
        if (tab.get('selected')) {
            return;
        }
        const selectedTab = this.__findSelectedTab();
        if (selectedTab) {
            selectedTab.set('selected', false);
        }
        tab.set('selected', true);
    },

    setEnabled(tabId, enabled) {
        this.__findTab(tabId).set({
            enabled
        });
    },

    setTabError(tabId, error) {
        this.__findTab(tabId).set({
            error
        });
    },

    __findSelectedTab() {
        return this.__tabsCollection.find(x => x.get('selected'));
    },

    __findTab(tabId) {
        helpers.assertArgumentNotFalsy(tabId, 'tabId');

        const tabModel = this.__tabsCollection.find(x => x.id === tabId);
        if (!tabModel) {
            helpers.throwInvalidOperationError(`TabLayout: tab '${tabId}' is not present in the collection.`);
        }
        return tabModel;
    },

    __handleSelect(model) {
        this.selectTab(model.id);
    },

    __onSelectedChanged(model) {
        this.__updateTabRegion(model);
    },

    __updateTabRegion(model) {
        const selected = model.get('selected');
        model.get('$regionEl').toggle(Boolean(selected));
    }
});
