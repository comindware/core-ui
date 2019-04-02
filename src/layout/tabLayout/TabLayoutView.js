// @flow
import { helpers } from 'utils';
import template from './templates/tabLayout.hbs';
import HeaderView from './HeaderView';
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

        this.tabs = options.tabs.reduce((s, a) => {
            s[a.id] = a.view;
            return s;
        }, {});
    },

    template: Handlebars.compile(template),

    className() {
        const classList = [];
        classList.push(this.getOption('bodyClass') || '');
        classList.push(this.getOption('showMoveButtons') ? 'layout__tab-layout--move' : '');

        return `${classes.CLASS_NAME} ${classList.join(' ')}`;
    },

    regions: {
        headerRegion: '.js-header-region',
        stepperRegion: '.js-stepper-region',
        loadingRegion: '.js-loading-region'
    },

    ui: {
        panelContainer: '.js-panel-container',
        buttonMoveNext: '.js-button_move-next',
        buttonMovePrevious: '.js-button_move-previous'
    },

    events: {
        'click @ui.buttonMoveNext': 'moveToNextTab',
        'click @ui.buttonMovePrevious': 'moveToPreviousTab'
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
        if (!this.getOption('showMoveButtons')) {
            this.ui.buttonMoveNext.hide();
            this.ui.buttonMovePrevious.hide();
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
            this.selectTabIndex = this.__getSelectedTabIndex(tab);
        }
        if (tab.get('enabled')) {
            if (!tab.get('isRendered') && this.isRendered()) {
                this.__renderTab(tab, Boolean(this.getOption('deferRender')));
            }
            tab.set('selected', true);
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
        const selectedtab = this.__findSelectedTab();
        if (tabId === selectedtab.id) {
            return;
        }
        let newTabIndex = this.__tabsCollection.indexOf(tab) + 1;
        if (newTabIndex === this.__tabsCollection.length) {
            newTabIndex -= 2;
        }
        this.selectTab(this.__tabsCollection.at(newTabIndex).id);
    },

    setTabError(tabId: string, error) {
        this.__findTab(tabId).set({ error });
    },

    moveToNextTab() {
        let errors = null;
        if (this.getOption('validateBeforeMove')) {
            const selectedTab = this.__findSelectedTab();
            errors = !selectedTab.get('view').form || selectedTab.get('view').form.validate();
            return this.setTabError(selectedTab.id, errors);
        }
        if (!errors) {
            let newIndex = this.selectTabIndex + 1;
            if (this.__tabsCollection.length - 1 < newIndex) {
                newIndex = 0;
            }
            const newTab = this.__tabsCollection.at(newIndex);
            if (newTab.get('enabled')) {
                this.selectTab(newTab.id);
            } else {
                this.selectTabIndex++;
                this.moveToNextTab();
            }
        }
    },

    moveToPreviousTab() {
        let errors = null;
        if (this.getOption('validateBeforeMove')) {
            const selectedTab = this.__findSelectedTab();
            errors = !selectedTab.get('view').form || selectedTab.get('view').form.validate();
            return this.setTabError(selectedTab.id, errors);
        }
        if (!errors) {
            let newIndex = this.selectTabIndex - 1;
            if (newIndex < 0) {
                newIndex = this.__tabsCollection.length - 1;
            }
            const newTab = this.__tabsCollection.at(newIndex);
            if (newTab.get('enabled')) {
                this.selectTab(this.__tabsCollection.at(newIndex).id);
            } else {
                this.selectTabIndex--;
                this.moveToPreviousTab();
            }
        }
    },

    setLoading(state: Boolean | Promise<any>) {
        this.loading.setLoading(state);
    },

    __renderTab(tabModel: Backbone.Model, isLoadingNeeded: boolean) {
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
                this.__showTab(region, tabModel, view, regionEl);
                this.setLoading(false);
            });
        } else {
            this.__showTab(region, tabModel, view, regionEl);
        }
    },

    __showTab(region, tabModel, view, regionEl) {
        region.show(view);
        tabModel.set({
            region,
            regionEl,
            isRendered: true
        });
        this.__updateTabRegion(tabModel);
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
