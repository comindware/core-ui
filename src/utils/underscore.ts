import { Model } from 'backbone';
import _ from 'underscore';

export default {
    cloneDeep(obj: Array<any> | Object | Model): Array<any> | Object {
        let out: Array<any> | Object;
        let i;
        const pureJSType = obj instanceof Model ? obj.toJSON() : obj; //converting Backbone to js

        if (Array.isArray(pureJSType)) {
            out = [];
            for (i = pureJSType.length; i;) {
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

    guid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;

            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },

    defaultsPure(...args: Array<any>): Object {
        return Object.assign({}, ...args.reverse());
    },

    cutOffTo(string: string, toStr: string, defaultString = string): string {
        return string.includes(toStr) ? string.slice(0, string.indexOf(toStr)) : defaultString;
    },

    capitalize(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    unCapitalize(string: string): string {
        return string.charAt(0).toLowerCase() + string.slice(1);
    },

    getResult(value: any, context?: Object, ...args: Array<any>): any {
        return typeof value === 'function' ? value.call(context, ...args) : value;
    },

    onlyUnique(array: Array<any>): Array<any> {
        return array.filter((value, index, self) => self.indexOf(value) === index);
    }
};
