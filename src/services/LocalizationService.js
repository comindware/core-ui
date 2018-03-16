//@flow
numeral.locale('en');
numeral.locale('de');
numeral.locale('ru');

const global = window;
const defaultLangCode = 'en';

type locOpt = {
    langCode?: string,
    timeZone?: string,
    localizationMap?: Object
};

export default (global.Localizer = {
    initialize(options: locOpt = {}) {
        this.langCode = options.langCode;
        this.timeZone = options.timeZone || moment.tz.guess();
        this.localizationMap = options.localizationMap;

        moment.tz.setDefault(this.timeZone);
        moment.locale(this.langCode);
        numeral.locale(this.langCode);
    },

    get(locId: string) {
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
});
