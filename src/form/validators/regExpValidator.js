/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';

const defaultRegExp = function(options) {
    if (!options.regexp) {
        throw new Error('Missing required "regexp" option for "regexp" validator');
    }

    options = _.extend({
        type: 'regexp',
        match: true,
        message: 'Invalid'
    }, options);

    return function regexp(value) {
        options.value = value;

        const err = {
            type: options.type,
            message: _.isFunction(options.message) ? options.message(options) : options.message
        };

        //Don't check empty values (add a 'required' validator for this)
        if (value === null || value === undefined || value === '') {
            return undefined;
        }

        //Create RegExp from string if it's valid
        if (typeof options.regexp === 'string') {
            options.regexp = new RegExp(options.regexp, options.flags);
        }

        if ((options.match) ? !options.regexp.test(value) : options.regexp.test(value)) {
            return err;
        }
        return undefined;
    };
};

formRepository.validators.regexp = function(options) {
    return _.wrap(defaultRegExp(options), (func, opts) => {
        const val = _.isObject(opts) ? opts.value : opts;
        return func(val);
    });
};

export default formRepository.validators.regexp;
