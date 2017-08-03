/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module */

'use strict';

import LocalizationService from '../../services/LocalizationService';

module.exports = function(textModel) {
    return LocalizationService.resolveLocalizedText(textModel);
};
