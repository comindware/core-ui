import { moment, numeral } from 'lib';
import numeralRu from 'numeral/locales/ru';
import numeralEn from 'numeral/locales/en-gb';
import numeralDe from 'numeral/locales/de';

numeral.locale('en', numeralEn);
numeral.locale('de', numeralDe);
numeral.locale('ru', numeralRu);

const global = window;
const defaultLangCode = 'en';

export default global.Localizer = {
    initialize(options) {
        this.langCode = options.langCode;
        this.timeZone = options.timeZone || moment.tz.guess();
        this.localizationMap = options.localizationMap;

        moment.tz.setDefault(this.timeZone);
        moment.locale(this.langCode);
        numeral.locale(this.langCode);
    },

    get(locId) {
        if (!locId) {
            throw new Error(`Bad localization id: (locId = ${locId})`);
        }
        const text = this.localizationMap[locId];

        if (text === undefined) {
            console.error(`Missing localization constant: ${locId}`);

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
