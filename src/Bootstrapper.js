/**
 * Developer: Stepan Burguchev
 * Date: 8/10/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers } from './utils/utilsApi';
import { $ } from './libApi';
import AjaxService from './services/AjaxService';
import MessageService from './services/MessageService';
import UserService from './services/UserService';
import WindowService from './services/WindowService';
import LocalizationService from './services/LocalizationService';

let initializeThirdParties = function () {
    $.fn.datetimepicker.dates[LocalizationService.langCode] = {
        days: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSFULL').split(','), //["Sunday", "Monday", ... ]
        daysShort: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','), //["Sun", "Mon", ... ],
        daysMin: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','),
        months: LocalizationService.get('CORE.FORMATS.DATETIME.MONTHS').split(','), //["January", "February", ... ]
        monthsShort: LocalizationService.get('CORE.FORMATS.DATETIME.MONTHSSHORT').split(','), //["Jan", "Feb", ... ]
        today: LocalizationService.get('CORE.FORMATS.DATETIME.TODAY'),
        meridiem: LocalizationService.get('CORE.FORMATS.DATETIME.MERIDIEM').split(',')
    };
};

export default {
    initialize: function (options) {
        helpers.ensureOption(options, 'localizationService');
        helpers.ensureOption(options, 'ajaxService');
        helpers.ensureOption(options, 'userService');

        UserService.initialize(options.userService);
        WindowService.initialize();
        LocalizationService.initialize(options.localizationService);
        AjaxService.load(options.ajaxService);

        initializeThirdParties();
    }
};
