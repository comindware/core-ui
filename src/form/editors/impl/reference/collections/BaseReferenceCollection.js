/**
 * Developer: Stepan Burguchev
 * Date: 12/4/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';
import HighlightableBehavior from '../../../../../collections/behaviors/HighlightableBehavior';
import SelectableBehavior from '../../../../../models/behaviors/SelectableBehavior';
import DefaultReferenceModel from '../models/DefaultReferenceModel';

const defaultOptions = {
    DEFAULT_COUNT: 200
};

export default Backbone.Collection.extend({
    constructor() {
        Backbone.Collection.prototype.constructor.apply(this, arguments);
        _.extend(this, new HighlightableBehavior(this));
        _.extend(this, new SelectableBehavior.SingleSelect(this));
    },

    fetch(options) {
        helpers.ensureOption(options, 'data.filter');
        if (options.data.count === undefined) {
            options.data.count = defaultOptions.DEFAULT_COUNT;
        }
        if (options.reset === undefined) {
            options.reset = true;
        }
        return Backbone.Collection.prototype.fetch.call(this, options);
    },

    parse(response, options) {
        this.totalCount = response.totalCount;
        return Backbone.Collection.prototype.parse.call(this, response.options, options);
    },

    model: DefaultReferenceModel,

    url: null
});
