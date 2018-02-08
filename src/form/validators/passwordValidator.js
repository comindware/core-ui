
/*eslint-disable*/

import 'lib';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';

formRepository.validators.password = function(options) {
    options = Object.assign({
        type: 'length',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PASSWORD'),
        min: 8
    }, options);

    return formRepository.validators.length(options);
};

export default formRepository.validators.password;
