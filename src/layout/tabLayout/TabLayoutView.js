// @flow
import { helpers } from 'utils';
import template from './templates/tabLayout.hbs';
import HeaderView from './TabHeaderView';
import StepperView from './StepperView';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';

type Tab = { view: any, id: string };

type TabsList = Array<Tab>;

const classes = {
    CLASS_NAME: 'layout__tab-layout',
    PANEL_REGION: 'layout__tab-layout__panel-region',
    HIDDEN: 'layout__tab-hidden'
};

export default Marionette.View.extend({
    initialize(options: { tabs: TabsList }) {
        helpers.ensureOption(options, 'tabs');

        this.__tabsCollection = options.tabs;
        if (!(this.__tabsCollection instanceof Backbone.Collection)) {
            this.__tabsCollection = new Backbone.Collection(this.__tabsCollection);
        }
        this.__tabsCollection.each(model => {
            if (model.get('enabled') === undefined) {
                model.set('enabled', true);
            }
            if (model.get('visible') === undefined) {
                model.set('visible', true);
            }
        });
        const selectedTab = this.__findSelectedTab();
        if (!selectedTab) {
            this.selectTab(this.__tabsCollection.at(0).id);
            this.selectTabIndex = 0;
        } else {
            this.__getSelectedTabIndex(selectedTab);
        }

        this.listenTo(this.__tabsCollection, 'change:selected', this.__onSelectedChanged);
        this.listenTo(this.__tabsCollection, 'change:visible', this.__onVisibleChanged);

        this.tabs = this.__tabsCollection.reduce((tabsViewById, tabOptionsModel) => {
            tabsViewById[tabOptionsModel.id] = tabOptionsModel.get('view');
            return tabsViewById;
        }, {});
    },

    template: Handlebars.compile(template),

    className() {
        const classList = [];
        classList.push(this.getOption('bodyClass') || '');

        return `${classes.CLASS_NAME} ${classList.join(' ')}`;
    },

    regions: {
        headerRegion: '.js-header-region',
        stepperRegion: '.js-stepper-region',
        loadingRegion: '.js-loading-region'
    },

    ui: {
        panelContainer: '.js-panel-container'
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        },
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion'
        }
    },

    onRender() {
        const headerView = new HeaderView({
            collection: this.__tabsCollection,
            headerClass: this.getOption('headerClass')
        });
        this.listenTo(headerView, 'select', this.__handleSelect);
        this.showChildView('headerRegion', headerView);
        if (this.getOption('deferRender')) {
            const selectedTab = this.__findSelectedTab();
            this.__renderTab(selectedTab, false);
        } else {
            this.__tabsCollection.forEach(model => {
                this.__renderTab(model, false);
            });
        }

        this.__updateState();
        if (this.getOption('showStepper')) {
            const stepperView = new StepperView({ collection: this.__tabsCollection });
            this.showChildView('stepperRegion', stepperView);
            this.listenTo(stepperView, 'stepper:item:selected', this.__handleStepperSelect);
        }
    },

    update() {
        Object.values(this.tabs).forEach(view => {
            if (view && typeof view.update === 'function') {
                view.update();
            }
        });
        this.__updateState();
    },

    validate() {
        let result;
        Object.entries(this.tabs).forEach(entrie => {
            const view = entrie[1];
            if (view && typeof view.validate === 'function') {
                const error = view.validate();
                this.setTabError(entrie[0], error);
                if (error) {
                    result = true;
                }
            }
        });
        return result;
    },

    getViewById(tabId: string) {
        return this.__findTab(tabId).get('view');
    },

    selectTab(tabId: string) {
        const tab = this.__findTab(tabId);
        if (tab.get('selected')) {
            return;
        }
        const selectedTab = this.__findSelectedTab();

        if (selectedTab) {
            if (this.getOption('validateBeforeMove')) {
                const errors = !selectedTab.get('view').form || selectedTab.get('view').form.validate();
                this.setTabError(selectedTab.id, errors);
                if (errors) {
                    return false;
                }
            }
            selectedTab.set('selected', false);
        }
        if (tab.get('enabled')) {
            tab.set('selected', true);
            if (!tab.get('isRendered') && this.isRendered()) {
                this.__renderTab(tab, false);
            }
            this.selectTabIndex = this.__tabsCollection.indexOf(tab);
        }
    },

    setEnabled(tabId: string, enabled: boolean) {
        this.__findTab(tabId).set({
            enabled
        });
    },

    setVisible(tabId: string, visible: boolean) {
        const tab = this.__findTab(tabId);
        tab.set({ visible });

        let selectedtab = this.__findSelectedTab();
        const visibleCollection = this.__tabsCollection.filter('visible');

        // all tabs hidden: show message instead of tab panel
        if (!visibleCollection.length) {
            this.__setNoTabsState(true);
            selectedtab.set('selected', false);
            return;
        }

        // show first tab, other tabs was hidden before
        if (visible && this.hasNoVisibleTabs) {
            tab.set('selected', true);
            selectedtab = tab;
            this.__setNoTabsState(false);

            return;
        }
        this.__setNoTabsState(false);

        // if we hide or show another tab, then nothing needs to be done
        if (tabId !== selectedtab.id) {
            return;
        }

        // if we hide selected tab, then another tab must be selected. The closest visible tab should be selected.
        const indexesOfVisibleCollection = visibleCollection.map(tabModel => this.__tabsCollection.indexOf(tabModel));
        const tabIndex = this.__tabsCollection.indexOf(tab);
        const newTabIndex = this.__getClosestVisibleTab(indexesOfVisibleCollection, tabIndex);

        this.selectTab(this.__tabsCollection.at(newTabIndex).id);
    },

    setLoading(state: Boolean | Promise<any>): void {
        this.loading.setLoading(state);
    },

    __renderTab(tabModel: Backbone.Model, isLoadingNeeded: boolean): void {
        const regionEl = document.createElement('div');
        regionEl.className = classes.PANEL_REGION;
        this.ui.panelContainer.append(regionEl);
        const region = this.addRegion(`${tabModel.id}TabRegion`, {
            el: regionEl
        });
        const view = tabModel.get('view');

        view.on('all', (...args) => {
            args[0] = `tab:${args[0]}`;
            this.trigger(...args);
        });
        if (isLoadingNeeded) {
            this.setLoading(true);
            setTimeout(() => {
                this.__showTab({ region, tabModel, view, regionEl });
                this.setLoading(false);
            });
        } else {
            this.__showTab({ region, tabModel, view, regionEl });
        }
    },

    __showTab(options): void {
        const { region, tabModel, view, regionEl } = options;

        region.show(view);
        tabModel.set({
            region,
            regionEl,
            isRendered: true
        });

        this.__updateTabRegion(tabModel);
    },

    __getClosestVisibleTab(indexes, tabIndex) {
        let min = this.__tabsCollection.length;
        let newTabIndex = 0;

        // find the closest index to given one
        indexes.forEach(index => {
            const newMin = Math.abs(index - tabIndex);
            if (newMin < min) {
                min = newMin;
                newTabIndex = index;
            }
        });

        return newTabIndex;
    },

    __setNoTabsState(hasNoTabs) {
        this.hasNoVisibleTabs = hasNoTabs;
        this.__toggleHiddenAttribute(this.el.querySelector('.js-panel-container'), hasNoTabs);
        this.__toggleHiddenAttribute(this.el.querySelector('.js-no-tabs-message'), !hasNoTabs);
    },

    __toggleHiddenAttribute(element, flag) {
        if (flag) {
            element.setAttribute('hidden', '');

            return;
        }
        element.removeAttribute('hidden');
    },

    setTabError(tabId: string, error) {
        this.__findTab(tabId).set({ error });
    },

    __findSelectedTab() {
        return this.__tabsCollection.find(x => x.get('selected'));
    },

    __getSelectedTabIndex(model) {
        return this.__tabsCollection.indexOf(model);
    },

    __findTab(tabId: string): Backbone.Model {
        helpers.assertArgumentNotFalsy(tabId, 'tabId');

        const tabModel = this.__tabsCollection.find(x => x.id === tabId);
        if (!tabModel) {
            helpers.throwInvalidOperationError(`TabLayout: tab '${tabId}' is not present in the collection.`);
        }
        return tabModel;
    },

    __handleSelect(model: Backbone.Model): void {
        this.selectTab(model.id);
    },

    __onSelectedChanged(model: Backbone.Model): void {
        this.__updateTabRegion(model);
    },

    __onVisibleChanged(model: Backbone.Model, visible: boolean): void {
        this.setVisible(model.id, visible);
    },

    __updateTabRegion(model: Backbone.Model): void {
        const regionEl = model.get('regionEl');
        if (!regionEl) {
            return;
        }
        const selected = model.get('selected');

        if (selected) {
            regionEl.classList.remove(classes.HIDDEN);
        } else {
            regionEl.classList.add(classes.HIDDEN);
        }

        this.trigger('changed:selectedTab', model);
        // model.get('regionEl').classList.toggle(classes.HIDDEN, !selected); //second argument don't work in IE 11;

        // todo: find bettter way to initiate child resize
        Core.services.GlobalEventService.trigger('window:resize', false);
    },

    __handleStepperSelect(model: Backbone.Model): void {
        this.__handleSelect(model);
    }
});
