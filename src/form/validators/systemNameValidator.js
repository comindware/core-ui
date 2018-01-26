/**
 * Developer: Ksenia Kartvelishvili
 * Date: 11.06.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

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
