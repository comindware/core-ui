import MembersSplitPanelView from '../views/MembersSplitPanelView';
import LocalizationService from '../../../../../services/LocalizationService';
import helpers from '../../../../../utils/helpers';
import ItemCollection from '../collection/ItemsCollection';
import ItemModel from '../model/ItemModel';

export default Marionette.Object.extend({
    initialize(options) {
        this.options = options;
        this.members = {};
        this.channel = new Backbone.Radio.channel(_.uniqueId('splitC'));
        this.channel.on('items:select', this.selectItemsByToolbar, this);
        this.channel.on('items:move', this.moveItems, this);
        this.channel.on('items:update', this.updateMembers, this);
        this.channel.on('items:cancel', this.cancelMembers, this);
        this.__createModel();

        this.channel = new Backbone.Radio.channel(_.uniqueId('membersSplitPanel'));
        this.channel.on('items:select', this.selectItemsByToolbar, this);
        this.channel.on('items:move', this.__onItemsMove, this);
    },

    fillInModel() {
        this.model.loading = this.__updateItems();
        this.model.set({
            title: this.__getFullMemberSplitTitle(),
            items: this.members,
            showUsers: !this.options.hideUsers,
            showGroups: !this.options.hideGroups,
            showAll: !this.options.hideUsers && !this.options.hideGroups,
            itemsToSelectText: this.options.itemsToSelectText,
            selectedItemsText: this.options.selectedItemsText,
            confirmEdit: true,
            showToolbar: !this.options.hideToolbar,
            emptyListText: this.options.emptyListText
        });
    },

    async getDisplayText() {
        await this.model.loading;
        let resultText = '';
        const members = this.model.get('items');

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

        if (_.isFunction(this.options.getDisplayText)) {
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

    async __updateItems() {
        const users = await this.options.users;
        const groups = await this.options.groups;

        users.forEach(model => (this.members[model.id] = model));

        groups.forEach(model => (this.members[model.id] = model));
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
        this.view = new MembersSplitPanelView({
            channel: this.channel,
            model: this.model
        });
    },

    __onItemsMove(...args) {
        this.moveItems(...args);
        setTimeout(() => this.updateMembers(), 100);
    },

    initItems() {
        this.createView();
        this.setValue();
    },

    updateMembers() {
        const allSelectedModels = _.clone(this.model.get('selected'));
        //allSelectedModels.filter(null); todo figure it out, WHY?!
        this.options.selected = allSelectedModels.models.map(model => model.id);
        this.trigger('popup:ok');
    },

    cancelMembers() {
        this.trigger('popup:cancel');
    },

    selectItemsByToolbar(type, value) {
        this.collectionFilterValue[type] = value;
        this.__applyFilter(type);
    },

    __applyFilter(type) {
        this.__createCollection(type);
        this.collection.selectNone();
        this.collection.unhighlight();

        const filterValue = this.collectionFilterValue[type];
        const searchValue = this.collectionSearchValue[type];

        if (!filterValue && !searchValue) {
            this.collection.filter(null);
            return;
        }
        this.collection.filter(model => {
            const modelType = model.get('type');
            const modelName = model.get('name');

            return (filterValue ? modelType && modelType === filterValue : true) && (searchValue ? modelName && modelName.toLowerCase().indexOf(searchValue) !== -1 : true);
        });
    },

    moveItems(typeFrom, typeTo, all, model) {
        const modelsTo = this.model.get(typeTo);
        const allSelectedModels = _.clone(modelsTo);
        const modelsFrom = this.model.get(typeFrom);

        const maxQuantitySelected = this.model.get('maxQuantitySelected');
        if (maxQuantitySelected && typeTo === 'selected') {
            allSelectedModels.filter(null);
            if (allSelectedModels.length >= maxQuantitySelected) {
                return;
            }
        }

        let selected = all ? [].concat(modelsFrom.models) : Object.values(modelsFrom.checked);
        model && selected.push(model);
        if (!all && !selected.length) {
            return;
        }

        if (maxQuantitySelected && typeTo === 'selected' && allSelectedModels) {
            if (allSelectedModels.length + selected.length > maxQuantitySelected) {
                selected = selected.slice(0, maxQuantitySelected - allSelectedModels.length);
            }
        }

        const selectedIndexFrom = [];

        modelsFrom.selectNone && modelsFrom.selectNone();
        modelsTo.selectNone && modelsTo.selectNone();
        modelsFrom.uncheckAll && modelsFrom.uncheckAll();
        modelsTo.uncheckAll && modelsTo.uncheckAll();

        const newSelectedFragment = this.collectionSearchValue[typeTo];

        selected.forEach(selectedModel => {
            if (!(selectedModel instanceof ItemModel)) {
                return;
            }
            if (this.options.orderEnabled) {
                if (typeTo === 'selected') {
                    const newOrder = modelsTo.length ? modelsTo.at(modelsTo.length - 1).get('order') + 1 : 1;
                    selectedModel.set('order', newOrder);
                } else {
                    selectedModel.unset('order');
                }
            }
            !all && selectedIndexFrom.push(modelsFrom.indexOf(selectedModel));
            modelsFrom.remove(selectedModel);
            modelsTo.add(selectedModel, { delayed: false });
            selectedModel.unhighlight();
            if (newSelectedFragment) {
                selectedModel.highlight(newSelectedFragment);
            }
            if (!all) {
                selectedModel.select();
            }
        });

        if (all) {
            return;
        }

        const nextIndexFrom = Math.min(Math.min.apply(0, selectedIndexFrom), modelsFrom.length - 1);
        if (nextIndexFrom < 0) {
            return;
        }
        const selectedElemFrom = modelsFrom.at(nextIndexFrom);
        selectedElemFrom.select();
    },

    __createCollection(type) {
        this.collection = this.model.get(type);
    },

    __createModel() {
        this.model = new Backbone.Model();

        const availableModels = new ItemCollection(
            new Backbone.Collection([], {
                model: ItemModel
            }),
            {
                isSliding: true,
                selectableBehavior: 'multi',
                comparator: Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Asc, 'name')
            }
        );
        if (this.groupConfig) {
            availableModels.group(this.groupConfig);
        }
        this.model.set('available', availableModels);

        const selectedComparator = this.options.orderEnabled
            ? Core.utils.helpers.comparatorFor(Core.utils.comparators.numberComparator2Asc, 'order')
            : Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Asc, 'name');

        const selectedModels = new ItemCollection(
            new Backbone.Collection([], {
                model: ItemModel
            }),
            {
                isSliding: true,
                selectableBehavior: 'multi',
                comparator: selectedComparator
            }
        );
        this.model.set('selected', selectedModels);

        this.model.set({
            maxQuantitySelected: this.options.maxQuantitySelected
        });

        this.model.set('allowRemove', this.options.allowRemove);
        this.fillInModel();
    },

    setValue() {
        this.collectionFilterValue = [];
        this.collectionSearchValue = [];
        this.__applyFilter('available');
        this.__applyFilter('selected');

        Promise.resolve(this.model.loading).then(() => {
            const items = _.clone(this.members);
            this.options.exclude.forEach(id => {
                if (items[id]) {
                    delete items[id];
                }
            });
            const selected = this.options.selected;
            let selectedItems = Array.isArray(selected)
                ? this.options.selected.map(id => {
                    const model = items[id];
                    delete items[id];
                    return model;
                })
                : [];

            const availableItems = Object.values(items);
            let i = 1;
            selectedItems = _.chain(selectedItems)
                .filter(item => item !== undefined)
                .map(item => {
                    if (this.options.orderEnabled) {
                        item.order = i++;
                    }
                    return item;
                })
                .value();

            this.model.get('available').reset(availableItems);
            this.model.get('selected').reset(selectedItems);
        });
    }
});
