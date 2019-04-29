export default class GroupedCollection {
    constructor(options) {
        this.allItems = options.allItems;
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
            model.group = this.ungrouped;
        });

        //TODO reset
    }

    move(models, targetName) {
        if (models) {
            const modelsArray = this.__getArrayCopy(models);
            modelsArray.length && modelsArray[0].group?.remove(modelsArray);

            const targetCollection = (targetName && this.groups[targetName]) || this.ungrouped;
            targetCollection.add(modelsArray);
            modelsArray.forEach(model => (model.group = targetCollection));
        }
    }

    getModels(targetGroupNme) {
        return this.__getArrayCopy(((targetGroupNme && this.groups[targetGroupNme]) || this.ungrouped).models);
    }

    getAllItemsModels() {
        return this.__getArrayCopy(this.allItems.models);
    }

    __getArrayCopy(models) {
        return models ? (Array.isArray(models) ? models : [models]).slice() : null;
    }
}
