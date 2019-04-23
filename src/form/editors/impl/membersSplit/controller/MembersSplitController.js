import LocalizationService from '../../../../../services/LocalizationService';
import helpers from '../../../../../utils/helpers';
import ItemCollection from '../collection/ItemsCollection';
import FilterState from '../classes/FilterState';
import AvailableGridView from '../views/AvailableGridView';
import SelectedGridView from '../views/SelectedGridView';
import { virtualCollectionFilterActions } from 'Meta';

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

export default Marionette.Object.extend({
    initialize(options) {
        this.options = options;
        this.filterFnParameters = options.filterFnParameters;
        this.filterFns = {
            [`filterFn_${this.filterFnParameters.users}`]: filterFnsConst.filterFnUsers.bind({}),
            [`filterFn_${this.filterFnParameters.groups}`]: filterFnsConst.filterFnGroups.bind({})
        };
        Object.values(this.filterFns).forEach(fn => Object.defineProperty(fn, 'parameters', { value: options.memberTypes }));

        this.members = {};
        this.bondedCollections = {};
        this.isMemberService = options.memberService && options.memberService.getMembers;

        this.__createModel();
    },

    fillInModel() {
        const showUsers = !this.options.hideUsers;
        const showGroups = !this.options.hideGroups;
        this.filterState = new FilterState({ showUsers, showGroups, filterFnParameters: this.filterFnParameters });
        this.model.initialized = this.__updateItems(this.filterState);
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
    },

    async getDisplayText() {
        await this.model.initialized;
        let resultText = '';
        const members = this.members;

        const membersCount = {
            users: 0,
            groups: 0
        };

        let selected = this.options.selected;

        if (selected) {
            if (!Array.isArray(selected)) {
                selected = [selected];
            }
            selected.forEach(id => {
                if (members[id]) {
                    membersCount[members[id].type]++;
                }
            });
        } else {
            selected = [];
        }

        if (typeof this.options.getDisplayText === 'function') {
            return this.options.getDisplayText(selected);
        }

        resultText = this.options.hideUsers
            ? ''
            : helpers.getPluralForm(membersCount.users, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.USERS')).replace('{0}', membersCount.users);
        resultText += resultText.length > 0 ? ' ' : '';
        resultText += this.options.hideGroups
            ? ''
            : helpers.getPluralForm(membersCount.groups, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.GROUPS')).replace('{0}', membersCount.groups);
        return resultText;
    },

    async __updateItems(filterState) {
        this.members = {};
        if (this.isMemberService) {
            try {
                this.__setLoading(true, { both: false });
                const data = await this.options.memberService.getMembers(this.__getSettings(filterState));
                if (!data.available) {
                    data.available = [];
                }
                if (!data.selected) {
                    data.selected = [];
                }
                data.available.forEach(item => (this.members[item.id] = item));
                data.selected.forEach(item => (this.members[item.id] = item));
                this.__processValues(data.selected);
                this.model.get('available').totalCount = data.totalCount;
            } catch (e) {
                console.log(e);
            } finally {
                this.__setLoading(false);
            }
        } else {
            this.__setLoading(true, { both: false });
            const users = await this.options.users;
            const groups = await this.options.groups;
            users.forEach(model => (this.members[model.id] = model));
            groups.forEach(model => (this.members[model.id] = model));
            this.__setLoading(false);
        }
    },

    __getSettings(filterState) {
        const selected = this.model.initialized ? this.model.get('selected').parentCollection.map(item => item.id) : this.options.selected;

        return {
            filterText: filterState.searchString || '',
            filterType: filterState.filterType,
            selected: selected || []
        };
    },

    __getFullMemberSplitTitle() {
        if (this.options.title) {
            switch (this.options.title) {
                case 'Members':
                    return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.MEMBERSTITLE');
                case 'Performers':
                    return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.PERFORMERSTITLE');
                default:
                    return this.options.title;
            }
        }
        return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.TITLE');
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
                      title: availableText
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

        this.bondedCollections[availableGridView.cid] = availableGridView.collection;
        this.bondedCollections[selectedGridView.cid] = selectedGridView.collection;

        [availableGridView, selectedGridView].forEach(view => {
            this.listenTo(view.gridView, 'execute:action', act => this.__executeAction(view, act));
            this.listenTo(view.controller, 'click', model => this.__moveItems(view, model));
        });
        if (this.isMemberService) {
            this.listenTo(availableGridView, 'members:update', filterState => this.__updateItems(filterState));
        }

        this.view.once('attach', () => availableGridView.gridView.searchView.focus());
        this.view.once('detach', () => (this.bondedCollections = {}));
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
            default:
                break;
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
            this.__updateItems(filterState);
        } else {
            gridView.collection.filter(() => false);
        }
    },

    __applyFilter(gridView, act) {
        const collection = gridView.collection;
        const actionId = act.get('id');
        const computedName = `${gridView.cid}_${actionId}`;
        const filterFn = this.filterFns[`filterFn_${actionId}`];

        if (!collection.filterFn) {
            collection.filterFn = [];
        }
        if (!act.get('isChecked')) {
            if (filterFn) {
                Object.defineProperty(filterFn, 'name', { value: computedName });
            }
            collection.filter(filterFn, { action: virtualCollectionFilterActions.PUSH });

            return;
        }
        collection.filter(computedName, { action: virtualCollectionFilterActions.REMOVE });
    },

    initItems() {
        this.createView();
        this.setValue();
    },

    updateMembers() {
        const allSelectedModels = Object.assign({}, this.model.get('selected').parentCollection);
        this.options.selected = allSelectedModels.models.map(model => model.id);
        this.trigger('popup:ok');
    },

    cancelMembers() {
        this.trigger('popup:cancel');
    },

    __createCollection(type) {
        this.collection = this.model.get(type);
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
        this.fillInModel();
    },

    async setValue() {
        await this.model.initialized;
        this.__processValues();
    },

    __processValues(selected = this.options.selected) {
        const items = Object.assign({}, this.members);
        this.options.exclude.forEach(id => {
            if (items[id]) {
                delete items[id];
            }
        });

        const selectedItems =
            Array.isArray(selected) && this.options.selected
                ? this.options.selected.map(id => {
                      const model = items[id];
                      delete items[id];
                      return model;
                  })
                : [];

        const availableItems = Object.values(items);

        this.model.get('available').set(availableItems);
        this.model.get('selected').set(selectedItems);
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
