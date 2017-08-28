/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { moment, numeral } from 'lib';
import { helpers } from 'utils';
import numeralRu from 'numeral/languages/ru';
import numeralEn from 'numeral/languages/en-gb';
import numeralDe from 'numeral/languages/de';

numeral.language('en', numeralEn);
numeral.language('de', numeralDe);
numeral.language('ru', numeralRu);

const global = window;
const defaultLangCode = 'en';

global.Localizer = {
    initialize(options) {
        helpers.ensureOption(options, 'langCode');
        helpers.ensureOption(options, 'localizationMap');
        helpers.ensureOption(options, 'warningAsError');

        this.langCode = options.langCode;
        this.localizationMap = options.localizationMap;
        this.warningAsError = options.warningAsError;

        moment.locale(this.langCode);
        numeral.language(this.langCode);
    },

    get(locId) {
        if (!locId) {
            throw new Error(`Bad localization id: (locId = ${locId})`);
        }
        const text = this.localizationMap[locId];
        if (text === undefined) {
            if (this.warningAsError) {
                throw new Error(`Failed to find localization constant ${locId}`);
            } else {
                console.error(`Missing localization constant: ${locId}`);
            }
            return `<missing:${locId}>`;
        }
        return text;
    },

    tryGet(locId) {
        if (!locId) {
            throw new Error(`Bad localization id: (locId = ${locId})`);
        }
        const text = this.localizationMap[locId];
        if (text === undefined) {
            return null;
        }
        return text;
    },

    resolveLocalizedText(localizedText) {
        if (!localizedText) {
            return '';
        }

        return localizedText[this.langCode] || localizedText[defaultLangCode] || '';
    }
};

export default global.Localizer;
