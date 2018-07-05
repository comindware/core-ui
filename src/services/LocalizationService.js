//@flow
const global = window;
const defaultLangCode = 'en';

type locOpt = {
    langCode?: string,
    timeZone?: string,
    localizationMap?: Object
};

type LocalizationService = {
    initialize: locOpt => void,

    langCode?: string,

    timeZone?: string,

    localizationMap?: Object,

    get(locId: string): string,

    tryGet(locId: string): ?string,

    resolveLocalizedText(localizedText: Object): string
};

const service: LocalizationService = {
    initialize(options: locOpt = {}) {
        this.langCode = options.langCode;
        this.timeZone = options.timeZone || moment.tz.guess();
        this.localizationMap = options.localizationMap;

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
