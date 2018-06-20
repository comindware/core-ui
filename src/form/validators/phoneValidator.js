/*eslint-disable*/

import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';
    
export default function(options) {
    return formRepository.validators.regexp(Object.Assign({
        type: 'phone',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PHONE'),
        regexp: /^\+?[0-9]+[0-9\-().\s]{7,}$/
    }, options));
};
