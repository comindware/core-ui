import MembersSplitPanelView from '../views/MembersSplitPanelView';
import LocalizationService from '../../../../../services/LocalizationService';
import helpers from '../../../../../utils/helpers';
import ItemCollection from '../collection/ItemsCollection';
import ItemModel from '../model/ItemModel';

export default Marionette.Object.extend({
    initialize(options) {
        this.options = options;
        this.channel = new Backbone.Radio.channel(_.uniqueId('splitC'));
        this.channel.on('items:select', this.selectItemsByToolbar, this);
        this.channel.on('items:move', this.moveItems, this);
        this.channel.on('items:update', this.updateMembers, this);
        this.channel.on('items:cancel', this.__cancelMembers, this);
        this.__createModel();
        this.__fillDisplayText();

        this.channel = new Backbone.Radio.channel(_.uniqueId('membersSplitPanel'));
        this.channel.on('items:select', this.selectItemsByToolbar, this);
        this.channel.on('items:move', this.__onItemsMove, this);
    },

    __fillInModel() {
        const users = this.options.users;
        const groups = this.options.groups;
        const members = {};

        users.forEach(model => (members[model.id] = model));

        groups.forEach(model => (members[model.id] = model));

        this.model.set({
            title: this.__getFullMemberSplitTitle(),
            items: members,
            showUsers: !this.options.hideUsers,
            showGroups: !this.options.hideGroups,
            showAll: !this.options.hideUsers && !this.options.hideGroups,
            itemsToSelectText: this.options.itemsToSelectText,
            selectedItemsText: this.options.selectedItemsText,
            confirmEdit: true,
            showToolbar: true,
            emptyListText: this.options.emptyListText
        });
    },

    __fillDisplayText() {
        const members = this.model.get('items');
        const membersCount = {
            users: 0,
            groups: 0
        };

        const selected = this.options.selected;

        selected
            && selected.forEach(id => {
                if (members[id]) {
                    membersCount[members[id].type]++;
                }
            });
        this.options.displayText = this.options.hideUsers
            ? ''
            : helpers.getPluralForm(membersCount.users, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.USERS')).replace('{0}', membersCount.users);
        this.options.displayText += this.options.displayText.length > 0 ? ' ' : '';
        this.options.displayText += this.options.hideGroups
            ? ''
            : helpers.getPluralForm(membersCount.groups, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.GROUPS')).replace('{0}', membersCount.groups);
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

    __onItemsMove(typeFrom, typeTo, all) {
        this.moveItems(typeFrom, typeTo, all);
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
        this.__fillDisplayText && this.__fillDisplayText();
        this.trigger('popup:ok');
    },

    __cancelMembers() {
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

    moveItems(typeFrom, typeTo, all) {
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

        let selected = all ? [].concat(modelsFrom.models) : Object.values(modelsFrom.selected);
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
        const newSelectedFragment = this.collectionSearchValue[typeTo];

        selected.forEach(model => {
            if (!(model instanceof ItemModel)) {
                return;
            }
            if (this.options.orderEnabled) {
                if (typeTo === 'selected') {
                    const newOrder = modelsTo.length ? modelsTo.at(modelsTo.length - 1).get('order') + 1 : 1;
                    model.set('order', newOrder);
                } else {
                    model.unset('order');
                }
            }
            !all && selectedIndexFrom.push(modelsFrom.indexOf(model));
            modelsFrom.remove(model);
            modelsTo.add(model, { delayed: false });
            model.unhighlight();
            if (newSelectedFragment) {
                model.highlight(newSelectedFragment);
            }
            if (!all) {
                model.select();
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
        this.__fillInModel();
    },

    setValue() {
        this.collectionFilterValue = [];
        this.collectionSearchValue = [];
        this.__applyFilter('available');
        this.__applyFilter('selected');

        Promise.resolve(this.model.get('items')).then(oldItems => {
            const items = _.clone(oldItems);
            this.options.exclude.forEach(id => {
                if (items[id]) {
                    delete items[id];
                }
            });
            const selected = this.options.selected;
            let selectedItems = selected
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
