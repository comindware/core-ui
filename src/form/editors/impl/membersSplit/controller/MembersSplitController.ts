import LocalizationService from '../../../../../services/LocalizationService';
import helpers from '../../../../../utils/helpers';
import ItemCollection from '../collection/ItemsCollection';
import FilterState from '../classes/FilterState';
import AvailableGridView from '../views/AvailableGridView';
import SelectedGridView from '../views/SelectedGridView';
import { virtualCollectionFilterActions } from 'Meta';
import Backbone from 'backbone';
import _ from 'underscore';

const toolbarActions = {
    MOVE_ALL: 'Move-all'
};

const filterFnsConst = {
    filterFnUsers: (model, parameters) => model.get('type') !== parameters.users,
    filterFnGroups: (model, parameters) => model.get('type') !== parameters.groups
};

const debounceInterval = {
    short: 100,
    medium: 300
};

export default Marionette.MnObject.extend({
    initialize(options) {
        this.options = options;
        this.filterFnParameters = options.filterFnParameters;
        this.filterFns = {
            [`filterFn_${this.filterFnParameters.users}`]: filterFnsConst.filterFnUsers.bind({}),
            [`filterFn_${this.filterFnParameters.groups}`]: filterFnsConst.filterFnGroups.bind({})
        };
        Object.values(this.filterFns).forEach(fn => Object.defineProperty(fn, 'parameters', { value: options.memberTypes }));

        this.members = {};
        this.isMemberService = options.memberService && options.memberService.getMembers;
        const showUsers = !this.options.hideUsers;
        const showGroups = !this.options.hideGroups;
        this.filterState = new FilterState({ showUsers, showGroups, filterFnParameters: this.filterFnParameters });
        this.__createModel();
        this.model.set({
            title: this.__getFullMemberSplitTitle(),
            items: this.members,
            showUsers,
            showGroups,
            itemsToSelectText: this.options.itemsToSelectText,
            selectedItemsText: this.options.selectedItemsText,
            confirmEdit: true,
            emptyListText: this.options.emptyListText
        });
        this.createView();
    },

    async getDisplayText() {
        await this.model.initialized;
        const membersCount = {
            users: 0,
            groups: 0
        };
        const members = this.members;
        const selected = this.options.selected;
        if (typeof selected === 'string') {
            membersCount[members[selected].type]++; 
        }
        if (Array.isArray(selected)) {
            selected.forEach(id => membersCount[members[id].type]++);
        }
        if (typeof this.options.getDisplayText === 'function') {
            return this.options.getDisplayText(selected);
        }
        const usersResultText = (this.options.hideUsers) ? '' : helpers.getPluralForm(membersCount.users, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.USERS')).replace('{0}', membersCount.users);
        const groupsResultText = (this.options.hideGroups) ? '' : helpers.getPluralForm(membersCount.groups, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.GROUPS')).replace('{0}', membersCount.groups);
        return usersResultText.concat(' ').concat(groupsResultText);
    },

    async updateItems(filterState) {
        this.members = {};
        this.__setLoading(true, { both: false });
        if (this.isMemberService) {
            try {
                const data = await this.options.memberService.getMembers(this.__getSettings(filterState));
                data.available.forEach(item => (this.members[item.id] = item));
                data.selected.forEach(item => (this.members[item.id] = item));
                this.processValues();
                this.model.get('available').totalCount = data.totalCount;
            } catch (e) {
                console.log(e);
            } finally {
                this.__setLoading(false);
            }
        } else {
            const users = await this.options.users;
            const groups = await this.options.groups;
            users.forEach(model => (this.members[model.id] = model));
            groups.forEach(model => (this.members[model.id] = model));
            this.processValues();
            this.__setLoading(false);
        }
    },

    __getSettings(filterState) {
        const selectedModels = this.model.initialized ? this.model.get('selected').parentCollection.map(item => item.id) : this.options.selected;
        const defaultSettings = {
            filterText: '',
            filterType: '',
            selected: []
        };
        const settings = {
            filterText: filterState.searchString,
            filterType: filterState.filterType,
            selected: selectedModels
        };
        return Object.assign(defaultSettings, settings)
    },

    __getFullMemberSplitTitle() {
        switch (this.options.title) {
            case 'Members':
                return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.MEMBERSTITLE');
            case 'Performers':
                return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.PERFORMERSTITLE');
            case undefined:
                return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.TITLE');
            default:
                return this.options.title;
        }
    },

    createView() {
        const gridViewOptions = {
            model: this.model,
            config: this.options.config,
            hideToolbar: this.options.hideToolbar,
            filterFnParameters: this.filterFnParameters
        };
        const availableText = this.options.itemsToSelectText;
        const availableGridView = this.isMemberService
            ? new AvailableGridView(
                  Object.assign({}, gridViewOptions, {
                      memberService: this.options.memberService,
                      filterFns: this.filterFns,
                      filterState: this.filterState,
                      title: availableText,
                      textFilterDelay: this.options.textFilterDelay
                  })
              )
            : new SelectedGridView(Object.assign({}, gridViewOptions, { membersCollection: this.model.get('available'), title: availableText }));
        const selectedGridView = new SelectedGridView(
            Object.assign({}, gridViewOptions, {
                title: this.options.selectedItemsText
            })
        );

        this.view = new Core.layout.HorizontalLayout({
            class: 'member-split-wrp',
            columns: [availableGridView, selectedGridView]
        });
        this.bondedCollections = {};
        this.bondedCollections[availableGridView.cid] = availableGridView.collection;
        this.bondedCollections[selectedGridView.cid] = selectedGridView.collection;

        [availableGridView, selectedGridView].forEach(view => {
            this.listenTo(view.gridView, 'execute', act => this.__executeAction(view, act));
            this.listenTo(view.gridView, 'click', model => this.__moveItems(view, model));
        });
        if (this.isMemberService) {
            this.listenTo(availableGridView, 'members:update', async filterState => {
                availableGridView.gridView.toggleSearchActivity(false);
                await this.updateItems(filterState);
                availableGridView.gridView.toggleSearchActivity(true);
            });
        }

        this.view.once('attach', () => availableGridView.gridView.searchView.focus());
    },

    __executeAction(gridView, act) {
        switch (act.get('id')) {
            case this.filterFnParameters.users:
            case this.filterFnParameters.groups:
                if (gridView.options.memberService) {
                    this.__updateFilterState(gridView, act);
                    break;
                }
                this.__applyFilter(gridView, act);
                break;
            case toolbarActions.MOVE_ALL:
                this.__moveItems(gridView);
                break;
            default: null;
        }
    },

    __updateFilterState(gridView, act) {
        const filterState = gridView.filterState;
        if (act.get('isChecked')) {
            filterState.add(act.get('id'));
        } else {
            filterState.remove(act.get('id'));
        }

        if (filterState.filterType) {
            gridView.collection.filter();
            this.updateItems(filterState);
        } else {
            gridView.collection.filter(() => false);
        }
    },

    __applyFilter(gridView, act) {
        const collection = gridView.collection;
        const actionId = act.get('id');
        const isChecked = act.get('isChecked');
        const filterFn = this.filterFns[`filterFn_${actionId}`];

        if (!collection.filterFn) {
            collection.filterFn = [];
        }
        if (!isChecked) {
            collection.filter(filterFn, { action: virtualCollectionFilterActions.PUSH });
        } else {
            collection.filter(filterFn, { action: virtualCollectionFilterActions.REMOVE });
        }
    },

    updateMembers() {
        const allSelectedModels = Object.assign({}, this.model.get('selected').parentCollection);
        this.options.selected = allSelectedModels.models.map(model => model.id);
        this.trigger('popup:ok');
    },

    cancelMembers() {
        this.trigger('popup:cancel');
    },

    __createModel() {
        this.model = new Backbone.Model();

        const availableModels = new ItemCollection(new Backbone.Collection([]), {
            isSliding: true,
            selectableBehavior: 'single',
            comparator: Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Asc, 'name')
        });
        if (this.groupConfig) {
            availableModels.group(this.groupConfig);
        }
        availableModels.totalCount = 0;
        this.model.set('available', availableModels);

        const selectedComparator = this.options.orderEnabled
            ? Core.utils.helpers.comparatorFor(Core.utils.comparators.numberComparator2Asc, 'order')
            : Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Asc, 'name');

        const selectedModels = new ItemCollection(new Backbone.Collection([]), {
            isSliding: true,
            selectableBehavior: 'single',
            comparator: selectedComparator
        });
        this.model.set('selected', selectedModels);

        this.model.set('allowRemove', this.options.allowRemove);
    },

    processValues() {
        const items = Object.assign({}, this.members);
        this.options.exclude.forEach(id => {
            if (items[id]) {
                delete items[id];
            }
        });

        const selectedItems =
            Array.isArray(this.options.selected)
                ? this.options.selected.map(id => {
                    const model = items[id];
                    delete items[id];
                    return model;
                })
                : this.options.selected
                    ? Object.assign({}, items[this.options.selected])
                    : [];

        if (typeof this.options.selected === 'string') {
            delete items[this.options.selected];
        }
        const availableItems = Object.values(items);

        this.model.get('available').reset(availableItems);
        this.model.get('selected').reset(selectedItems);
    },

    __moveItems(gridView, model) {
        const source = this.bondedCollections[gridView.cid];
        const target = Object.entries(this.bondedCollections).find(x => x[0] !== gridView.cid)[1];
        const movingModels = model || Object.assign([], source.models);

        target.parentCollection.add(movingModels);
        source.parentCollection.remove(movingModels);
        _.debounce(this.updateMembers(), model ? debounceInterval.medium : debounceInterval.short);
        target.rebuild();
        source.rebuild();
        if (!model) {
            source.trigger('filter');
        }
    },

    __setLoading(state, { both } = { both: true }) {
        if (this.view && !this.view.isDestroyed()) {
            if (both) {
                this.view.columns.forEach(view => {
                    view.setLoading(state);
                });
            } else {
                this.view.columns[0].setLoading(state);
            }
        }
    }
});
