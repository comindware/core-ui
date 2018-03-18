import RequiredValidator from './validators/requiredValidator';
import LengthValidator from './validators/lengthValidator';
import PasswordValidator from './validators/passwordValidator';
import PhoneValidator from './validators/phoneValidator';
import SystemNameValidator from './validators/systemNameValidator';
import EmailValidator from './validators/emailValidator';

export default {
    editors: {},
    validators: {
        RequiredValidator,
        LengthValidator,
        PasswordValidator,
        PhoneValidator,
        SystemNameValidator,
        EmailValidator
    }
};
