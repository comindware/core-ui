import LocalizationService from '../../services/LocalizationService';
import _ from 'underscore';

export default function ({ type = 'required', message = LocalizationService.get('CORE.FORM.VALIDATION.REQUIRED'), enabled = () => true } = {}) {
    const requiredValidator = function (value) {
        const val = _.isObject(value) && 'value' in value ? value.value : value;

        const err = {
            type,
            message: _.getResult(message, this, { type, message })
        };
        if (val === null || val === undefined || val === '') {
            return err;
        }
        if (Array.isArray(val) && val.length === 0) {
            return err;
        }
    };

    const required = function required(value: any) {
        return _.getResult(enabled) ? requiredValidator(value) : undefined;
    };

    required.name || (required.name = 'required'); //IE has no default name.

    return required;
}
