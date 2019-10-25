export default class GroupedCollection {
    constructor(options) {
        this.allItems = options.allItems;
        this.groupsSortOptions = options.groupsSortOptions;
        this.groups = {};

        options.groups.forEach(groupName => {
            const group = new options.class();
            this.groups[groupName] = group;
        });

        this.allCollapsibleItems = new options.class();
        this.allItems.listenTo(this.allItems, 'remove', model => {
            model.trigger('destroy', model);
        });

        this.allItems.listenTo(this.allItems, 'add', model => {
            const { kindConst, groupNames } = this.groupsSortOptions;
            if (model.get('kind') === kindConst) {
                this.groups[groupNames.const].add(model);
            } else {
                this.allCollapsibleItems.add(model);
            }
        });

        this.reset();
    }

    getCollapsibleModels() {
        return this.allCollapsibleItems.slice();
    }

    reset() {
        const { kindConst, groupNames } = this.groupsSortOptions;

        // used models, because allCollapsibleItem is Virtual Collection with 'filter' feature.
        const allModels = this.allItems.models;

        const collapsibleModels = allModels.filter(model => model.get('kind') !== kindConst);
        const constModels = allModels.filter(model => model.get('kind') === kindConst);

        this.allCollapsibleItems.reset(collapsibleModels);
        this.groups[groupNames.main].reset();
        this.groups[groupNames.menu].reset();
        this.groups[groupNames.const].reset(constModels);
    }
}
