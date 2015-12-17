/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    define([ 'core/libApi', 'localizationMap' ], function (lib) {
        var defaultLangCode = 'en';
        var langCode = global.langCode;
        var isProductionEnv = global.compiled;
        var localizationMap = global['LANGMAP' + langCode.toUpperCase()];

        global.Localizer = {
            langCode: langCode,

            get: function (locId) {
                if (!locId) {
                    throw new Error('Bad localization id: (locId = ' + locId + ')');
                }
                var text = localizationMap[locId];
                if (text === undefined) {
                    if (isProductionEnv) {
                        throw new Error('Failed to find localization constant ' + locId);
                    } else {
                        console.error('Missing localization constant: ' + locId);
                    }
                    return '<missing:' +  locId + '>';
                }
                return text;
            },

            tryGet: function(locId) {
                if (!locId) {
                    throw new Error('Bad localization id: (locId = ' + locId + ')');
                }
                var text = localizationMap[locId];
                if (text === undefined) {
                    return null;
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
