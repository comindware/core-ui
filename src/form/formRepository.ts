import RequiredValidator from './validators/requiredValidator';
import LengthValidator from './validators/lengthValidator';
import PasswordValidator from './validators/passwordValidator';
import PhoneValidator from './validators/phoneValidator';
import SystemNameValidator from './validators/systemNameValidator';
import EmailValidator from './validators/emailValidator';
import CodeValidation from './validators/codeValidation';
import RegExpValidator from './validators/regExpValidator';
import LoginValidator from './validators/loginValidator';

export default {
    editors: {},
    validators: {
        required: RequiredValidator,
        length: LengthValidator,
        password: PasswordValidator,
        phone: PhoneValidator,
        systemName: SystemNameValidator,
        email: EmailValidator,
        code: CodeValidation,
        regexp: RegExpValidator,
        login: LoginValidator
    }
};
