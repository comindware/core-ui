export default class BaseDiffMap<T> extends Map {
    delete(key: string) {
        const isDeleted = super.delete(key);
        if (isDeleted && this.size === 0) {
            console.log('zero'); //TODO notify subscribers
        }

        return isDeleted;
    }

    toObject() {
        return Array.from(this).reduce((obj: { [prop: string]: T }, [key, value]) => ((obj[key] = value), obj), {});
    }
}
