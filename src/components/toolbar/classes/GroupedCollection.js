export default class GroupedCollection {
    constructor(options) {
        this.allItems = options.allItems;
        this.groups = {};

        const listenChanges = group => {
            group.listenTo(group, 'add reset', models => {
                if (models) {
                    if (models.length) {
                        models.forEach(model => (model.group = group));
                    } else {
                        models.group = group;
                    }
                }
            });
        };

        options.groups.forEach(groupName => {
            const group = new options.class();
            listenChanges(group);
            this.groups[groupName] = group;
        });

        this.ungrouped = new options.class();
        listenChanges(this.ungrouped);
    }

    move(models, target) {
        if (models) {
            const modelsArray = [...(Array.isArray(models) ? models : [models])];
            modelsArray.length && modelsArray[0].group.remove(modelsArray);

            const targetCollection = (target && this.groups[target]) || this.ungrouped;
            targetCollection.add(modelsArray);
        }
    }

    reset(models, target) {
        if (target) {
            const modelsArray = [...(Array.isArray(models) ? models : [models])];
            this.groups[target].reset(modelsArray);
        }
    }

    ungroup(models) {
        this.move(models);
    }

    getModels(target) {
        return [...(target === 'all' ? this.allItems.models : ((target && this.groups[target]) || this.ungrouped).models)];
    }
}
