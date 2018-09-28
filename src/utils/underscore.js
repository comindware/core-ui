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
    },

    guid: function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    defaultsPure: function(...args){
        return Object.assign({}, ...(args.reverse()));
    }
};
