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
    
Backbone.Form.validators.phone = function (options) {
    options = _.extend({
        type: 'phone',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PHONE'),
        regexp: /^\+?[0-9]+[0-9\-().\s]{7,}$/
    }, options);

    return Backbone.Form.validators.regexp(options);
};

export default Backbone.Form.validators.phone;
