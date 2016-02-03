/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import LocalizationService from '../../services/LocalizationService';

Backbone.Form.validators.errMessages.letters = LocalizationService.get('CORE.FORM.VALIDATION.LETTERS');

Backbone.Form.validators.letters = function (options) {
    options = _.extend({
        type: 'letters',
        message: Backbone.Form.validators.errMessages.letters,
        regexp: lib.XRegExp('^[\\p{L}-]+$')
    }, options);

    return Backbone.Form.validators.regexp(options);
};

export default Backbone.Form.validators.letters;
