/**
 * Developer: Stepan Burguchev
 * Date: 8/10/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers } from './utils/utilsApi';
import AjaxService from './services/AjaxService';
import MessageService from './services/MessageService';
import UserService from './services/UserService';
import WindowService from './services/WindowService';
import LocalizationService from './services/LocalizationService';

export default {
    initialize: function (options) {
        helpers.ensureOption(options, 'localizationService');
        helpers.ensureOption(options, 'ajaxService');
        helpers.ensureOption(options, 'windowService');
        helpers.ensureOption(options, 'userService');

        UserService.initialize(options.userService);
        WindowService.initialize(options.windowService);
        LocalizationService.initialize(options.localizationService);
        AjaxService.load(options.ajaxService);

        AjaxService.on('jsApi:error', function () {
            MessageService.error(
                LocalizationService.get('CORE.BOOTSTRAPPER.ERRORS.DEFAULT.DESCRIPTION'),
                LocalizationService.get('CORE.BOOTSTRAPPER.ERRORS.DEFAULT.TITLE'));
        });
    }
};
