/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';

formRepository.validators.length = function(options) {
    options = _.extend({
        type: 'length',
        message: LocalizationService.get('CORE.FORM.VALIDATION.LENGTH')
    }, options);

    return function length(value) {
        const val = _.isObject(value) ? value.value : value;
        options.value = val;
        const err = {
            type: options.type,
            message: _.isFunction(options.message) ? options.message(options) : options.message
        };
        //Don't check empty values (add a 'required' validator for this)
        if (val === null || val === undefined || val === '') return;

        if (options.min) {
            if (val.length < options.min) {
                return err;
            }
        }
        if (options.max) {
            if (val.length > options.max) {
                return err;
            }
        }
    };
};

export default formRepository.validators.length;
