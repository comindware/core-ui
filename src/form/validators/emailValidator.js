export default config => {
    const options = Object.Assign(
        {
            type: 'email',
            message: Localizer.get('CORE.FORM.VALIDATION.EMAIL')
        },
        config
    );

    return function email(value) {
        options.value = value;

        const err = {
            type: options.type,
            message: _.isFunction(options.message) ? options.message(options) : options.message
        };
        if (value === null || value === undefined || value === false || value === '') {
            return true;
        }

        if (!/^[\w\-]{1,}([\w\-\+.]{1,1}[\w\-]{1,}){0,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test(value)) {
            return err;
        }
    };
};
