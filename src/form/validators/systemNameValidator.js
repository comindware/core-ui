export default config => {
    const options = Object.Assign(
        {
            type: 'invalidIdentifier',
            message: Localizer.get('CORE.FORM.VALIDATION.SYSTEMNAME')
        },
        config
    );

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
