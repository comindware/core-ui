/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import 'lib';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';

formRepository.validators.required = function (options) {
    options = _.extend({
        type: 'required',
        message: LocalizationService.get('CORE.FORM.VALIDATION.REQUIRED')
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

export default formRepository.validators.required;
