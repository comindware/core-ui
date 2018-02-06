/**
 * Developer: Stepan Burguchev
 * Date: 6/14/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

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
