//@flow
export default class {
    constructor(attriutes: {} = {}, options) {
        this.attributes = attriutes;

        this.id = attriutes.id || Symbol('');

        this.initialize();
    }

    initialize() { }

    get(attributeKey: string): any {
        return this.attributes[attributeKey];
    }

    set(attribute: {}): any {
        Object.keys(attribute).forEach(key => {
            this.attributes[key] = attribute[key];
        });
    }

    static extend(extendObject: any) {
        //todo remove
        return Object.assign(this, extendObject);
    }

    on() { }

    off() { }

    has(attributeKey: string) {
        return attributeKey in this.attributes;
    }

    toJSON() {
        return this.attributes;
    }
}
