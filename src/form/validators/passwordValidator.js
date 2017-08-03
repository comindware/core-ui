/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';

formRepository.validators.password = function(options) {
    options = _.extend({
        type: 'length',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PASSWORD'),
        min: 8
    }, options);

    return formRepository.validators.length(options);
};

export default formRepository.validators.password;
