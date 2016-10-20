/**
 * Developer: Stepan Burguchev
 * Date: 6/14/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import core from 'coreApi';
import { initializeCore } from '../utils/helpers';
import 'jasmine-jquery';

describe('Editors', function () {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

    describe('Common', function () {
        it('has polyfills', function () {
            let localPolyfills = Object.assign({}, {a:2});
            let globalPolyfills = "asd".includes('a');
        });
    });
});
