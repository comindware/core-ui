
export default {
    cloneDeep: function(obj) {
        var out,
            i;
        if (_.isArray(obj)) {
            out = [];
            for (i = obj.length; i;) {
                --i;
                out[i] = _.cloneDeep(obj[i]);
            }
            return out;
        }

        if (_.isObject(obj) && typeof obj !== 'function') {
            out = {};
            for (i in obj) { out[i] = _.cloneDeep(obj[i]); }
            return out;
        }
        return obj;
    }
};
