import RequiredValidator from './validators/requiredValidator';
import LengthValidator from './validators/lengthValidator';
import PasswordValidator from './validators/passwordValidator';
import PhoneValidator from './validators/phoneValidator';
import SystemNameValidator from './validators/systemNameValidator';
import EmailValidator from './validators/emailValidator';

import passToEmptyEditor from './sideEditorEffects/passToEmptyEditor';
import translitToSystemName from './sideEditorEffects/translitToSystemName';

export default {
    editors: {},
    validators: {
        required: RequiredValidator,
        length: LengthValidator,
        password: PasswordValidator,
        phone: PhoneValidator,
        systemName: SystemNameValidator,
        email: EmailValidator
    },
    sideEditorEffects: {
        passToEmptyEditor,
        translitToSystemName
    }
};
