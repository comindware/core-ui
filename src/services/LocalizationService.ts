import helpers from '../utils/helpers';

const global = window;
const defaultLangCode = 'en';

type locOpt = {
    langCode?: string,
    timeZone?: string,
    localizationMap?: Object
};

interface LocalizationService {
    initialize(options: locOpt): void;

    langCode?: string;

    timeZone?: string;

    thousandsSeparatorSymbol?: string;

    decimalSymbol?: string;

    localizationMap?: Object;

    get(locId: string): string;

    replaceParams(locId: string): string;

    tryGet(locId: string): string;

    resolveLocalizedText(localizedText: Object): string;
}

const service: LocalizationService = {
    initialize(options: locOpt = {}) {
        this.langCode = options.langCode;
        this.timeZone = options.timeZone || moment.tz.guess();
        this.localizationMap = options.localizationMap || {};

        const formattedNumber = new Intl.NumberFormat(this.langCode, {
            minimumFractionDigits: 2
        }).format(1000);

        this.thousandsSeparatorSymbol = formattedNumber.slice(1, 2);
        this.decimalSymbol = formattedNumber.slice(-3, -2);

        moment.tz.setDefault(this.timeZone);
        moment.locale(this.langCode);
    },

    get(locId: string) {
        this.localizationMap = this.localizationMap || {};
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

    replaceParams(locId: string, zero, one, two, ...args) {
        return helpers.replaceParams(this.get(locId), zero, one, two, ...args);
    },

    tryGet(locId: string) {
        if (!locId) {
            throw new Error(`Bad localization id: (locId = ${locId})`);
        }
        const text = this.localizationMap[locId];
        if (text === undefined) {
            return null;
        }
        return text;
    },

    resolveLocalizedText(localizedText: Object) {
        if (!localizedText) {
            return '';
        }

        return localizedText[this.langCode] || localizedText[defaultLangCode] || '';
    }
};

export default (global.Localizer = service);
