/*eslint-ignore*/

import { initializeCore } from '../utils/helpers';
import 'jasmine-jquery';

describe('Editors', () => {
    beforeEach(function() {
        this.rootRegion = initializeCore();
    });

    describe('Common', () => {
        it('has polyfills', () => {
            const localPolyfills = Object.assign({}, { a: 2 });
            const globalPolyfills = 'asd'.includes('a');
        });
    });
});
