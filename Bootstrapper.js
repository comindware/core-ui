/**
 * Developer: Stepan Burguchev
 * Date: 8/10/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    './utils/utilsApi',
    './serviceLocator',
    './services/AjaxService',
    './services/MessageService',
    './services/LocalizationService'
], function (utilsApi, serviceLocator, AjaxService, MessageService, LocalizationService) {
    'use strict';

    return {
        initialize: function (options) {
            utilsApi.helpers.ensureOption(options, 'cacheService');

            serviceLocator.cacheService = options.cacheService;

            AjaxService.on('jsApi:error', function () {
                /*
                 var exceptionCode = (data && data.exceptionCode.toUpperCase()) + '';
                 var exceptionVars = [].concat((data && data.extraData) || []);

                 var localizedError = window.Localizer.get('PROJECT.COMMON.ERRORS.' + exceptionCode);
                 if (typeof localizeError === 'undefined')
                 localizedError = window.Localizer.get('PROJECT.COMMON.ERRORS.' + exceptionCode.replace('COMINDWARE.PLATFORM.CORE.', '').replace('COMINDWARE.TRACKER.CORE.', '')) || localize('DEFAULT') || exceptionCode;

                 var errorText = localizedError;
                 var text = errorText.replace(/\[title:[^\]]+\]/g, ''),
                 title = errorText.replace(/\[title:([^\]]+)\].*!/g, '$1');

                 if (exceptionCode === 'COMINDWARE.PLATFORM.CORE.UNIQUEPROPERTYCHECKEXCEPTION') {
                 exceptionVars.push('#' + exceptionVars[0]);
                 }
                 text = _.reduce(exceptionVars, function(fullText, text, i) {
                 return fullText.replace('{' + i + '}', text);
                 }, text);

                 Ajax._dialog.set(title, text).open();
                * */
                MessageService.error(
                    LocalizationService.get('CORE.BOOTSTRAPPER.ERRORS.DEFAULT.DESCRIPTION'),
                    LocalizationService.get('CORE.BOOTSTRAPPER.ERRORS.DEFAULT.TITLE'));
            });
        }
    };
});
