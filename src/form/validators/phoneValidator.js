/*eslint-disable*/

import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';
    
formRepository.validators.phone = function(options) {
    return formRepository.validators.regexp(_.extend({
        type: 'phone',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PHONE'),
        regexp: /^\+?[0-9]+[0-9\-().\s]{7,}$/
    }, options));
};

export default formRepository.validators.phone;
