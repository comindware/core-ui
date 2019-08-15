import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';
import _ from 'underscore';

export default function(options) {
    return formRepository.validators.regexp(
        _.extend(
            {
                type: 'phone',
                message: LocalizationService.get('CORE.FORM.VALIDATION.PHONE'),
                regexp: /^\+?[0-9]+[0-9\-().\s]{10,}$/
            },
            options
        )
    );
}
