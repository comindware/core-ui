export default config => {
    const options = _.extend(
        {
            type: 'invalidIdentifier',
            message: Localizer.get('CORE.FORM.VALIDATION.LOGIN')
        },
        config
    );

    return function login(value) {
        options.value = value;

        const err = {
            type: options.type,
            message: _.isFunction(options.message) ? options.message(options) : options.message
        };
        if (value === null || value === undefined || value === false || value === '') {
            return;
        }

        if (typeof value !== 'string' || value.length > 20) {
            return err;
        }

        if (/[ "\/\\\[\]:;\|=,\+\*\?<>]/.test(value)) {
            return err;
        }

        if (/[а-яё]/.test(value)) {
            return err;
        }
    };
};
