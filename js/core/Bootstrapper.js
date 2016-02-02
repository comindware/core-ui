/**
 * Developer: Stepan Burguchev
 * Date: 8/10/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers } from './utils/utilsApi';
import serviceLocator from './serviceLocator';
import AjaxService from './services/AjaxService';
import MessageService from './services/MessageService';
import LocalizationService from './services/LocalizationService';

export default {
    initialize: function (options) {
        helpers.ensureOption(options, 'cacheService');

        serviceLocator.cacheService = options.cacheService;

        AjaxService.on('jsApi:error', function () {
            MessageService.error(
                LocalizationService.get('CORE.BOOTSTRAPPER.ERRORS.DEFAULT.DESCRIPTION'),
                LocalizationService.get('CORE.BOOTSTRAPPER.ERRORS.DEFAULT.TITLE'));
        });
    }
};
