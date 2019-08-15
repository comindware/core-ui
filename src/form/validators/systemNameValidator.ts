import LocalizationService from '../../services/LocalizationService';
import _ from 'underscore';

export default config => {
    const options = _.extend(
        {
            type: 'invalidIdentifier',
            message: LocalizationService.get('CORE.FORM.VALIDATION.SYSTEMNAME')
        },
        config
    );

    return function systemName(value) {
        options.value = value;

        const err = {
            type: options.type,
            message: typeof options.message === 'function' ? options.message(options) : options.message
        };
        if (value === null || value === undefined || value === false || value === '') {
            return;
        }

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
            return err;
        }
    };
};
