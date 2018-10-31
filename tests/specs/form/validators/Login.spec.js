import core from 'coreApi';
import 'jasmine-jquery';

const validator = core.form.repository.validators.login();
const correctLogin = 'oleg!@comindware.com';

const errorType = 'invalidIdentifier';
const errorMessage = Core.services.LocalizationService.get('CORE.FORM.VALIDATION.LOGIN');

describe('Validators:', () => {
    describe('Login:', () => {
        it('should return correct err object', () => {
            const result = validator('?');

            expect(typeof result).toEqual('object');
            expect(result.type).toEqual(errorType);
            expect(result.message).toEqual(errorMessage);
        });

        it('should return undefined if login correct', () => {
            const result = validator(correctLogin);

            expect(result).toEqual(undefined);
        });

        it('should return error if login is a russian text', () => {
            const result = validator('Сколково');

            expect(typeof result).toEqual('object');
            expect(result.type).toEqual(errorType);
            expect(result.message).toEqual(errorMessage);
        });

        it('should return error if login is more 20 characters', () => {
            const result = validator('ggggggggggggggggggggg');

            expect(typeof result).toEqual('object');
            expect(result.type).toEqual(errorType);
            expect(result.message).toEqual(errorMessage);
        });
    })
});
