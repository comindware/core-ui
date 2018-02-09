
import formRepository from '../formRepository';

export default formRepository.validators.systemName = config => {
    const options = Object.assign({
        type: 'invalidIdentifier',
        message: Localizer.get('PROJECT.COMMON.FORM.VALIDATION.SYSTEMNAME')
    }, config);

    return function systemName(value) {
        options.value = value;

        const err = {
            type: options.type,
            message: _.isFunction(options.message) ? options.message(options) : options.message
        };
        if (value === null || value === undefined || value === false || value === '') {
            return;
        }

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
            return err;
        }
    };
};
