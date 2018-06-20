/*eslint-disable*/

import LocalizationService from '../../services/LocalizationService';

export default function(options) {
    options = Object.Assign({
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
