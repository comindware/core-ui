export default class GroupedCollection {
    constructor(options) {
        this.allItems = options.allItems;
        this.groupsSortOptions = options.groupsSortOptions;
        this.groups = {};

        options.groups.forEach(groupName => {
            const group = new options.class();
            this.groups[groupName] = group;
        });

        this.ungrouped = new options.class();

        this.allItems.listenTo(this.allItems, 'remove', model => {
            model.group.remove(model);
            delete model.group;
        });

        this.allItems.listenTo(this.allItems, 'add', model => {
            this.ungrouped.add(model);
            this.__moveToGroupByKind(model);
        });

        this.reset();
    }

    move(models, targetName) {
        if (!models) {
            return;
        }
        const modelsArray = this.__getArrayCopy(models);
        modelsArray.length && modelsArray[0].group?.remove(modelsArray);

        const targetCollection = (targetName && this.groups[targetName]) || this.ungrouped;
        targetCollection.add(modelsArray);
        modelsArray.forEach(model => (model.group = targetCollection));
    }

    getModels(targetName) {
        return this.__getArrayCopy(((targetName && this.groups[targetName]) || this.ungrouped).models);
    }

    getAllItemsModels() {
        return this.__getArrayCopy(this.allItems.models);
    }

    reset() {
        Object.values(this.groups).forEach(group => group.reset());
        this.getAllItemsModels().forEach(model => {
            this.__moveToGroupByKind(model);
        });
    }

    __moveToGroupByKind(model) {
        const { kindConst, constGroupName, mainGroupName } = this.groupsSortOptions;
        this.move(model, model.get('kind') === kindConst ? constGroupName : mainGroupName);
    }

    __getArrayCopy(models) {
        return models ? (Array.isArray(models) ? models : [models]).slice() : null;
    }
}
