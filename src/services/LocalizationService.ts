import { moment } from '../lib';

const global = window;
const defaultLangCode = 'en';

type locOpt = {
    langCode?: string,
    timeZone?: string,
    localizationMap?: Object
};

type LocalizationService = {
    initialize: Function,

    langCode?: string,

    timeZone?: string,

    thousandsSeparatorSymbol?: string,

    decimalSymbol?: string,

    localizationMap?: Object,

    get(locId: string): string,

    replaceParams(locId: string): string,

    tryGet(locId: string): string,

    resolveLocalizedText(localizedText: Object): string
};

const service: LocalizationService = {
    initialize(options: locOpt = {}) {
        this.langCode = options.langCode;
        this.timeZone = options.timeZone || moment.tz.guess();
        this.localizationMap = options.localizationMap;

        const formattedNumber = new Intl.NumberFormat(this.langCode, {
            minimumFractionDigits: 2
        }).format(1000);

        this.thousandsSeparatorSymbol = formattedNumber.slice(1, 2);
        this.decimalSymbol = formattedNumber.slice(-3, -2);

        //TODO remove this then server start to return full date
        const offset = moment.tz.zone(this.timeZone).utcOffset(new Date());
        const unpacked = {
            name: 'Custom/CMW',
            abbrs: ['CMWC', 'CMWC'],
            offsets: [offset, offset],
            untils: [-1988164200000, null]
        };
        moment.tz.add(moment.tz.pack(unpacked));

        moment.tz.setDefault('Custom/CMW');
        //moment.tz.setDefault(this.timeZone); //this line is perfect, use it
        //End of hack

        moment.locale(this.langCode);
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

    replaceParams(locId: string, ...args) {
        const value = this.get(locId);

        if (typeof value !== 'string') {
            return '';
        }
        return value.replace(/\{(\d)\}/g, (s, num) => args[num]);
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
    },

    /**
     * Accepts string and duplicates it into every field of LocalizedText object.
     * The LocalizedText  looks like this: <code>{ en: 'foo', de: 'foo', ru: 'foo' }</code>.
     * @param {String} defaultText A text that is set into each field of the resulting LocalizedText object.
     * @return {Object} LocalizedText object like <code>{ en, de, ru }</code>.
     * */
    createLocalizedText(defaultText: string) {
        return {
            en: defaultText,
            de: defaultText,
            ru: defaultText
        };
    }
};

export default (global.Localizer = service);
