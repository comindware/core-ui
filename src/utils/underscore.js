export default {
    cloneDeep(obj) {
        let out;
        let i;
        const pureJSType = obj && obj.toJSON ? obj.toJSON() : obj; //converting Backbone to js

        if (Array.isArray(pureJSType)) {
            out = [];
            for (i = pureJSType.length; i; ) {
                --i;
                out[i] = _.cloneDeep(pureJSType[i]);
            }

            return out;
        }

        if (_.isObject(pureJSType) && typeof pureJSType !== 'function') {
            out = {};
            _.map(pureJSType, (value, key) => {
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

    defaultsPure(...args) {
        return Object.assign({}, ...args.reverse());
    }
};
