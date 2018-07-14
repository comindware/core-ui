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
            Object.entries(pureJSType).forEach(entrie => (out[entrie[0]] = _.cloneDeep(entrie[1])));

            return out;
        }

        return pureJSType;
    }
};
