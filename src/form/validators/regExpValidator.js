/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import LocalizationService from '../../services/LocalizationService';

let regExpOld = Backbone.Form.validators.regexp;

Backbone.Form.validators.regexp = function (options) {
    return _.wrap(regExpOld(options), function (func, value) {
        var val = _.isObject(value) ? value.value : value;
        return func(val);
    });
};

export default Backbone.Form.validators.regexp;
