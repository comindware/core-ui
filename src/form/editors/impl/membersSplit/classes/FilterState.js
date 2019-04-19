export default class FilterSate {
    constructor(options) {
        this.filterFnParameters = options.filterFnParameters;
        this.filterType =
            options.showGroups && options.showUsers 
                ? this.filterFnParameters.all 
                : options.showUsers 
                    ? this.filterFnParameters.users 
                    : this.filterFnParameters.groups;
    }

    add(arg) {
        if (!this.filterType) {
            this.filterType = arg;
            return;
        }
        if (this.filterType === this.filterFnParameters.all) {
            return;
        }
        if (this.filterType !== arg) {
            this.filterType = this.filterFnParameters.all;
        }
    }

    remove(arg) {
        if (this.filterType === this.filterFnParameters.all) {
            this.filterType = arg === this.filterFnParameters.users 
                ? this.filterFnParameters.groups 
                : this.filterFnParameters.users;
            return;
        }
        this.filterType = '';
    }

    setSearchString(text) {
        this.searchString = text;
    }
}
