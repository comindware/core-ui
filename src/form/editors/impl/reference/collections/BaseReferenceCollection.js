import { helpers } from 'utils';
import VirtualCollection from '../../../../../collections/VirtualCollection';

const defaultOptions = {
    DEFAULT_COUNT: 200
};

export default VirtualCollection.extend({
    fetch(options) {
        helpers.ensureOption(options, 'data.filter');
        if (options.data.count === undefined) {
            options.data.count = defaultOptions.DEFAULT_COUNT;
        }
        if (options.reset === undefined) {
            options.reset = true;
        }
        return VirtualCollection.prototype.fetch.call(this, options);
    },

    parse(responseData, options) {
        const response = responseData.data;

        this.totalCount = response.totalCount;
        return Backbone.Collection.prototype.parse.call(this, response.options, options);
    },

    url: null
});
