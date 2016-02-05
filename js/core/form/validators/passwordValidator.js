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

Backbone.Form.validators.password = function(options) {
    options = _.extend({
        type: 'length',
        message: LocalizationService.get('CORE.FORM.VALIDATION.PASSWORD'),
        min: 8
    }, options);

    return Backbone.Form.validators.length(options);
};

export default Backbone.Form.validators.password;
