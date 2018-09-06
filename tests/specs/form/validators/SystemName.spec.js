import core from 'coreApi';
import 'jasmine-jquery';

const validator = core.form.repository.validators.systemName();
const correctAlias = '_alias1234';

const errorType = 'invalidIdentifier';
const errorMessage = Core.services.LocalizationService.get('CORE.FORM.VALIDATION.SYSTEMNAME');

describe('Validators:', () => {
    describe('SystemName:', () => {
        it('should return correct err object', () => {
            const result = validator(String.fromCharCode(64546)); //"ﰢ"

            expect(typeof result).toEqual('object');
            expect(result.type).toEqual(errorType);
            expect(result.message).toEqual(errorMessage);
        });

        it('should return undefined if alias correct', () => {
            const result = validator(correctAlias);

            expect(result).toEqual(undefined);
        });

        it('should return error if alias starts with number', () => {
            const result = validator('9number');

            expect(typeof result).toEqual('object');
            expect(result.type).toEqual(errorType);
            expect(result.message).toEqual(errorMessage);
        });

        it('should return error if alias is a russian text', () => {
            const result = validator('Сколково');

            expect(typeof result).toEqual('object');
            expect(result.type).toEqual(errorType);
            expect(result.message).toEqual(errorMessage);
        });

    })
});
