/*eslint-disable*/

import LocalizationService from '../../services/LocalizationService';

export default function(
    {
        type = 'required',
        message = LocalizationService.get('CORE.FORM.VALIDATION.REQUIRED'),
        enabled = () => true
    } = {}
    ) {

    const requiredValidator = function(value) {
        const val = _.isObject(value) && 'value' in value ? value.value : value;

        const err = {
            type,
            message: typeof message === 'function' ? message({ type, message }) : message
        };
        if (val === null || val === undefined || val === '') {
            return err;
        }
        if (Array.isArray(val) && val.length === 0) {
            return err;
        }
    };

    const required = function required(value) {
        return enabled() ? requiredValidator(value) : undefined
    };

    required.name || (required.name = 'required'); //IE has no default name.

    return required;
}
