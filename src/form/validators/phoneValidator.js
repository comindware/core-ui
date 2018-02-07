
/*eslint-disable*/

import 'lib';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';
    
formRepository.validators.phone = function(options) {
    return formRepository.validators.regexp(Object.assign({
        type: 'phone',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PHONE'),
        regexp: /^\+?[0-9]+[0-9\-().\s]{7,}$/
    }, options));
};

export default formRepository.validators.phone;
