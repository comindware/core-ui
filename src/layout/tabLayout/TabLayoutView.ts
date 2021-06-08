import { helpers } from 'utils';
import template from './templates/tabLayout.hbs';
import TabHeaderView from './TabHeaderView';
import StepperView from './StepperView';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import TabModel from './models/TabModel';
import ConfigDiff from '../../components/treeEditor/classes/ConfigDiff';
import { ChildsFilter, TreeConfig, GraphModel } from '../../components/treeEditor/types';

type Tab = { view: Backbone.View, id: string, name: string, enabled?: boolean, visible?: boolean, error?: string };
type TabsList = Array<Tab>;
type TabsKeyValue = { [key: string]: Backbone.View };
type ShowTabOptions = { region: Marionette.Region, tabModel: TabModel, view: Backbone.View, regionEl: HTMLElement };

const classes = {
    CLASS_NAME: 'layout__tab-layout',
    PANEL_REGION: 'layout__tab-layout__panel-region',
    HIDDEN: 'layout__tab-hidden'
};

const defaultOptions = {
    headerClass: '',
    bodyClass: ''
};

export default Marionette.View.extend({
    initialize(options: { tabs: TabsList, showTreeEditor?: boolean }) {
        helpers.ensureOption(options, 'tabs');
        _.defaults(options, defaultOptions);

        this.showTreeEditor = options.showTreeEditor;
        this.__initializeTabCollection(options.tabs);
        this.tabs = this.__tabsCollection.reduce((tabsViewById, tabOptionsModel) => {
            tabsViewById[tabOptionsModel.id] = tabOptionsModel.get('view');
            return tabsViewById;
        }, {});
    },

    template: Handlebars.compile(template),

    className(): string {
        const classList = [];
        classList.push(this.getOption('bodyClass') || '');

        return `${classes.CLASS_NAME} ${classList.join(' ')}`;
    },

    regions: {
        headerRegion: {
            el: '.js-header-region',
            replaceElement: true
        },
        treeEditorRegion: '.js-tree-editor-region',
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

    onRender(): void {
        const tabHeaderView = new TabHeaderView({
            collection: this.__tabsCollection,
            headerClass: this.getOption('headerClass')
        });

        this.listenTo(tabHeaderView, 'select', model => this.__handleSelect(model));
        this.showChildView('headerRegion', tabHeaderView);

        if (this.showTreeEditor) {
            this.treeEditorView = this.treeEditor.getView();
            this.showChildView('treeEditorRegion', this.treeEditorView);

            const configDiff = this.treeEditor.getConfigDiff();
            this.__tabsCollection.forEach((model: TabModel) => {
                const isHidden = configDiff.get(model.id)?.isHidden;

                if (typeof isHidden === 'boolean') {
                    model.set({ isHidden });
                }
            });
        }

        this.listenTo(this.__tabsCollection, 'change:selected', this.__onSelectedChanged);
        this.listenTo(this.__tabsCollection, 'change:isHidden change:visible', this.__onChangeShowing);

        if (this.isAllHiddenTab()) {
            this.__setNoTabsState(true);
        } else {
            const selectedTab = this.__getSelectedTab();
            if (this.options.autoRender !== false) {
                if (this.getOption('deferRender') && !this.isAllHiddenTab()) {
                    this.renderTab(selectedTab, false);
                } else {
                    this.__tabsCollection.forEach(model => {
                        this.renderTab(model, false);
                    });
                }
            }

            if (selectedTab) {
                this.selectTab(selectedTab.id);
            }
        }

        this.__updateState();
        if (this.getOption('showStepper')) {
            const stepperView = new StepperView({ collection: this.__tabsCollection });
            this.showChildView('stepperRegion', stepperView);
            this.listenTo(stepperView, 'stepper:item:selected', this.__handleStepperSelect);
        }
    },

    update(): void {
        Object.values(this.tabs).forEach(view => {
            if (view && typeof view.update === 'function') {
                view.update();
            }
        });
        this.__updateState();
    },

    validate(): void {
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

    selectTab(tabId: string): void | boolean {
        const tab = this.__findTab(tabId);

        if (tab.get('selected')) {
            return;
        }

        const previousSelectedTab = this.__getSelectedTab();

        if (previousSelectedTab) {
            if (this.getOption('validateBeforeMove')) {
                const errors = !previousSelectedTab.get('view').form || previousSelectedTab.get('view').form.validate();
                this.setTabError(previousSelectedTab.id, errors);
                if (errors) {
                    return false;
                }
            }
        }

        if (tab.get('enabled')) {
            tab.set('selected', true);
            if (!tab.get('isRendered') && this.isRendered() && this.options.autoRender !== false) {
                this.renderTab(tab, Boolean(this.getOption('deferRender')));
            }

            this.selectTabIndex = this.__getTabIndex(tab);
        }

        // For IE (scroll position jumped up when tabs reselected)
        if (previousSelectedTab) {
            previousSelectedTab.set('selected', false);
        }
    },

    setEnabled(tabId: string, enabled: boolean): void {
        this.__findTab(tabId).set({ enabled });
    },

    setVisible(tabId: string, visible: boolean): void {
        this.__findTab(tabId).set({ visible });
    },

    isAllHiddenTab() {
        const visibleCollection = this.__tabsCollection.filter(tabModel => tabModel.isShow());

        // all tabs hidden: show message instead of tab panel
        if (!visibleCollection.length) {
            return true;
        }
        return false;
    },

    getTabsCollection() {
        return this.__tabsCollection;
    },

    __onChangeShowing(tab: Backbone.Model) {
        const isShow = tab.isShow();

        const visibleCollection = this.__tabsCollection.filter(tabModel => tabModel.isShow());
        let newTabIndex;

        let selectedtab = this.__getSelectedTab();

        if (this.isAllHiddenTab()) {
            this.__setNoTabsState(true);
            selectedtab?.set('selected', false);
            return;
        }
        // show first tab, other tabs was hidden before
        if (isShow && this.hasNoVisibleTabs) {
            tab.set('selected', true);
            selectedtab = tab;
            this.__setNoTabsState(false);

            return;
        }

        this.__setNoTabsState(false);

        // if we hide or show another tab, then nothing needs to be done
        if (tab.id !== selectedtab.id) {
            return;
        }

        // if we hide selected tab, then another tab must be selected. Let it be the closest one.
        const tabIndex = this.__tabsCollection.indexOf(tab);
        if (visibleCollection.length) {
            const indexesOfVisibleCollection = visibleCollection.map((tabModel: TabModel) => this.__tabsCollection.indexOf(tabModel));
            newTabIndex = this.__getClosestVisibleTab(indexesOfVisibleCollection, tabIndex);
        } else {
            newTabIndex = tabIndex;
        }


        this.selectTab(this.__tabsCollection.at(newTabIndex).id);
    },

    setTabError(tabId: string, error: string): void {
        this.__findTab(tabId).set({ error });
    },

    setLoading(state: Boolean | Promise<any>): void {
        this.loading.setLoading(state);
    },

    __getClosestVisibleTab(indexes: number[], tabIndex: number): number {
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

    __setNoTabsState(hasNoTabs: boolean): void {
        this.hasNoVisibleTabs = hasNoTabs;
        this.__toggleHiddenAttribute(this.el.querySelector('.js-panel-container'), hasNoTabs);
        this.__toggleHiddenAttribute(this.el.querySelector('.js-no-tabs-message'), !hasNoTabs);
    },

    __toggleHiddenAttribute(element: HTMLElement, flag: boolean): void {
        if (flag) {
            element.setAttribute('hidden', '');

            return;
        }
        element.removeAttribute('hidden');
    },

    __initializeTabCollection(tabsCollection: Backbone.Collection | TabsList): void {
        if (!tabsCollection) {
            Core.InterfaceError.logError('tabsCollection must be passed');
        }

        this.__tabsCollection = tabsCollection instanceof Backbone.Collection ? tabsCollection : new Backbone.Collection(tabsCollection, { model: TabModel });

        this.__tabsCollection.forEach((model: TabModel) => {
            if (model.get('enabled') == null) {
                model.set('enabled', true);
            }
            if (model.get('visible') == null) {
                model.set('visible', true);
            }

            if (model.isShow == null) {
                model.isShow = TabModel.prototype.isShow;
            }
        });

        let selectedTab = this.__getSelectedTab();
        if (!selectedTab) {
            selectedTab = this.__tabsCollection.find((tabModel: Backbone.Model) => tabModel.isShow() && tabModel.get('enabled')) || this.__tabsCollection.at(0);
            this.selectTab(selectedTab.id);
        }
        this.selectTabIndex = this.__getTabIndex(selectedTab);

        if (this.showTreeEditor) {
            this.__initTreeEditor();
        }
    },

    renderTab(tabModel: Backbone.Model, isLoadingNeeded: boolean): void {
        const regionEl = document.createElement('div');
        regionEl.className = classes.PANEL_REGION;
        this.ui.panelContainer.append(regionEl);
        const region = this.addRegion(`${tabModel.id}TabRegion`, {
            el: regionEl
        });
        const view = tabModel.get('view');

        this.listenTo(view, 'all', (...args) => {
            args[0] = `tab:${args[0]}`;
            this.trigger(...args);
        });
        this.listenTo(view, 'change:visible', (model, visible) => this.setVisible(tabModel.id, visible));
        this.listenTo(view, 'change:enabled', (model, enabled) => this.setEnabled(tabModel.id, enabled));
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

    __showTab(options: ShowTabOptions): void {
        const { region, tabModel, view, regionEl } = options;

        region.show(view);
        tabModel.set({
            region,
            regionEl,
            isRendered: true
        });

        this.__updateTabRegion(tabModel);
    },

    __getSelectedTab(): TabModel {
        const selectedTab = this.__tabsCollection.find((tabModel: TabModel) => tabModel.get('selected'));

        return selectedTab;
    },

    __getTabIndex(model: TabModel): number {
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

    __updateTabRegion(model: Backbone.Model): void {
        const regionEl = model.get('regionEl');
        if (!regionEl) {
            return;
        }
        const selected = model.get('selected');

        regionEl.classList.toggle(classes.HIDDEN, !selected);

        this.trigger('changed:selectedTab', model);

        Core.services.GlobalEventService.trigger('popout:resize', false);
    },

    __handleStepperSelect(model: Backbone.Model): void {
        this.__handleSelect(model);
    },

    __initTreeEditor(): void {
        this.treeModel = new Backbone.Model({
            name: 'Tabs', //TODO Localize, getNodeName
            rows: this.__tabsCollection
        });
        this.__tabsCollection.forEach((tabModel: GraphModel) => {
            tabModel.isContainer = true;
            tabModel.childrenAttribute = 'tabComponents';
            tabModel.set('tabComponents', new Backbone.Collection([{ id: _.uniqueId('treeItem'), name: 'tab content' }])); //TODO generate proper childrens
        });
        this.treeModel.id = _.uniqueId('treeModelRoot');
        this.treeModel.isContainer = !!this.__tabsCollection.length;
        this.treeModel.childrenAttribute = 'rows';

        const treeEditorOptions: {
            model: TreeConfig,
            hidden: boolean,
            configDiff: ConfigDiff,
            childsFilter?: ChildsFilter
        } = {
            model: this.treeModel,
            hidden: this.options.treeEditorIsHidden,
            configDiff: this.options.treeEditorConfig
        };

        const childsFilter = this.options.treeEditorChildsFilter;

        if (typeof childsFilter === 'function') {
            treeEditorOptions.childsFilter = childsFilter;
        }

        this.treeEditor = new Core.components.TreeEditor(treeEditorOptions);
    }
});
