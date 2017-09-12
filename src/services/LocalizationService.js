/**
 * Developer: Stepan Burguchev
 * Date: 8/4/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { moment, numeral } from 'lib';
import numeralRu from 'numeral/locales/ru';
import numeralEn from 'numeral/locales/en-gb';
import numeralDe from 'numeral/locales/de';

numeral.locale('en', numeralEn);
numeral.locale('de', numeralDe);
numeral.locale('ru', numeralRu);

const global = window;
const defaultLangCode = 'en';

global.Localizer = {
    initialize(options) {
        this.langCode = options.langCode;
        this.localizationMap = options.localizationMap;
        this.warningAsError = options.warningAsError;

        moment.locale(this.langCode);
        numeral.locale(this.langCode);
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
