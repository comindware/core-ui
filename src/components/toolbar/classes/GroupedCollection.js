export default class GroupedCollection {
    constructor(options) {
        this.allItems = options.allItems;
        this.groupsSortOptions = options.groupsSortOptions;
        this.groups = {};

        options.groups.forEach(groupName => {
            const group = new options.class();
            this.groups[groupName] = group;
        });

        this.allCollaplibleItems = new options.class();
        this.allItems.listenTo(this.allItems, 'remove', model => {
            model.trigger('destroy', model);
        });

        this.allItems.listenTo(this.allItems, 'add', model => {
            const { kindConst, groupNames } = this.groupsSortOptions;
            if (model.get('kind') === kindConst) {
                this.groups[groupNames.const].add(model);
            } else {
                this.allCollaplibleItems.add(model);
            }
        });

        this.reset();
    }

    getModels(targetName) {
        return ((targetName && this.groups[targetName]) || this.allCollaplibleItems).slice();
    }

    getAllItemsModels() {
        return this.allItems.parentCollection.slice();
    }

    reset() {
        const { kindConst, groupNames } = this.groupsSortOptions;

        const collabpsibleModels = this.allItems.parentCollection.filter(model => model.get('kind') !== kindConst);
        const constModels = this.allItems.parentCollection.filter(model => model.get('kind') === kindConst);

        this.allCollaplibleItems.reset(collabpsibleModels);
        this.groups[groupNames.main].reset();
        this.groups[groupNames.menu].reset();
        this.groups[groupNames.const].reset(constModels);
    }
}
