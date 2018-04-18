/*eslint-ignore*/
import 'jasmine-jquery';

describe('Editors', () => {
    describe('Common', () => {
        it('has polyfills', () => {
            const localPolyfills = Object.assign({}, { a: 2 });
            const globalPolyfills = 'asd'.includes('a');
        });
    });
});
