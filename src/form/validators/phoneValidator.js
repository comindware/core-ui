/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';
    
formRepository.validators.phone = function(options) {
    options = _.extend({
        type: 'phone',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PHONE'),
        regexp: /^\+?[0-9]+[0-9\-().\s]{7,}$/
    }, options);

    return formRepository.validators.regexp(options);
};

export default formRepository.validators.phone;
