import LocalizationService from '../../services/LocalizationService';
import _ from 'underscore';

export default config => {
    const options = _.extend(
        {
            type: 'email',
            message: LocalizationService.get('CORE.FORM.VALIDATION.EMAIL')
        },
        config
    );

    return function email(value) {
        options.value = value;

        const err = {
            type: options.type,
            message: typeof options.message === 'function' ? options.message(options) : options.message
        };
        if (value === null || value === undefined || value === false || value === '') {
            return;
        }

        if (!/^[\w\-]{1,}([\w\-\+.]{1,1}[\w\-]{1,}){0,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test(value)) {
            return err;
        }
    };
};
