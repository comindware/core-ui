import { Model } from 'backbone';
declare var _: any;

export default {
    cloneDeep(obj: Array<any> | object | Model): Array<any> | object {
        let out: Array<any> | object;
        let i;
        const pureJSType = obj instanceof Model ? obj.toJSON() : obj; //converting Backbone to js

        if (Array.isArray(pureJSType)) {
            out = [];
            for (i = pureJSType.length; i; ) {
                --i;
                // @ts-ignore
                out[i] = _.cloneDeep(pureJSType[i]);
            }

            return out;
        }

        if (_.isObject(pureJSType) && typeof pureJSType !== 'function') {
            out = {};
            _.map(pureJSType, (value: any, key: string) => {
                // @ts-ignore
                out[key] = _.cloneDeep(value);
            });

            return out;
        }

        return pureJSType;
    },

    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;

            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },

    defaultsPure(...args: Array<any>) {
        return Object.assign({}, ...args.reverse());
    },

    cutOffTo(string: string, toStr: string, defaultString = string): string {
        return string.includes(toStr) ?
            string.slice(0, string.indexOf(toStr)) :
            string;
    }
};
