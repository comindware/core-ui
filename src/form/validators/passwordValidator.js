/*eslint-disable*/

import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';

export default function(options) {
    options = _.extend({
        type: 'length',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PASSWORD'),
        min: 8
    }, options);

    return formRepository.validators.length(options);
};
