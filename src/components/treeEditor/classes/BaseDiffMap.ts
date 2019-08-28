export default class BaseDiffMap<T> extends Map {
    delete(key: string) {
        const isDeleted = super.delete(key);

        if (isDeleted && this.size === 0) {
            //TODO notify subscribers
        }

        return isDeleted;
    }
}
