/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    define([ 'module/lib', 'localizationMap' ], function (lib) {
        var defaultLangCode = 'en';
        var langCode = global.langCode;
        var localizationMap = global['LANGMAP' + langCode.toUpperCase()];

        global.Localizer = {
            langCode: langCode,

            get: function (locId) {
                var text = localizationMap[locId];
                if (text === undefined) {
                    throw new Error('Failed to find localization constant ' + locId);
                }
                return text;
            },

            resolveLocalizedText: function (localizedText) {
                if (!localizedText) {
                    return '';
                }

                return localizedText[langCode] || localizedText[defaultLangCode] || '';
            }
        };
        return global.Localizer;
    });
}(this));
