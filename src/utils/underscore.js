export default {
    cloneDeep: function (obj) {
        var out;
        var i;
        var pureJSType = obj && obj.toJSON ? obj.toJSON() : obj; //converting Backbone to js

        if (_.isArray(pureJSType)) {
            out = [];
            for (i = pureJSType.length; i;) {
                --i;
                out[i] = _.cloneDeep(pureJSType[i]);
            }

            return out;
        }

        if (_.isObject(pureJSType) && typeof pureJSType !== 'function') {
            out = {};
            _.map(pureJSType, function (value, key) {
                out[key] = _.cloneDeep(value);
            });

            return out;
        }

        return pureJSType;
    }
};
