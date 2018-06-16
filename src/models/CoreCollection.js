//@flow
import CoreModel from './CoreModel';

export default class {
    constructor(models: Array<CoreModel> = [], options) {
        this.model = CoreModel;
        this.models = models.map(model => new this.model(model));

        this.initialize();
    }

    initialize() {}

    add(newModel: CoreModel): any {
        this.models.push(newModel);
    }

    remove(modelToRemove: string): any {
        this.models.slice(1, this.models.findIndex(collectionsModel => collectionsModel.id === modelToRemove.id));
    }

    reset(newModels: string): any {
        return (this.models = newModels);
    }

    static extend(extendObject: any) {
        //todo remove
        return Object.assign(this, extendObject);
    }

    on() {}

    off() {}

    has(attributeKey: string) {
        return attributeKey in this.attributes;
    }

    toJSON() {
        return this.map(model => model.toJSON());
    }

    forEach() {
        this.models.forEach.call(...args);
    }

    map() {
        return this.models.map.call(...args);
    }

    find() {
        return this.models.find.call(...args);
    }
}
