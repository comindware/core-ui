/* Specification

    The login name used to support clients and servers running earlier versions of the operating system, such as Windows NT 4.0, Windows 95, Windows 98, and LAN Manager.
    This attribute must be 20 characters or less to support earlier clients, and cannot contain any of these characters:
    "/ \ [ ] : ; | = , + * ? < >
    https://docs.microsoft.com/en-us/windows/desktop/adschema/a-samaccountname
*/

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
            message: typeof options.message === 'function' ? options.message(options) : options.message
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
