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

Backbone.Form.validators.errMessages.required = LocalizationService.get('CORE.FORM.VALIDATION.REQUIRED');

Backbone.Form.validators.required = function (options) {
    options = _.extend({
        type: 'required',
        message: this.errMessages.required
    }, options);

    return function required(value) {
        var val = _.isObject(value) && _.has(value, 'value') ? value.value : value;
        options.value = val;

        var err = {
            type: options.type,
            message: _.isFunction(options.message) ? options.message(options) : options.message
        };
        if (val === null || val === undefined || val === false || val === '') {
            return err;
        }
        if (_.isArray(val) && val.length === 0) {
            return err;
        }
    };
};

export default Backbone.Form.validators.required;
