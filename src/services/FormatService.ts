import meta from '../Meta';

const formatLocalisePrefix = 'PROCESS.RECORDTYPES.CONTEXT.FORMATS';
//test
export default {
    getEditorTypeByFormat(format) {
        switch (format) {
            case meta.objectPropertyFormats.SHORT_DATE:
            case meta.objectPropertyFormats.LONG_DATE:
            case meta.objectPropertyFormats.CONDENSED_DATE:
            case meta.objectPropertyFormats.MONTH_DAY:
            case meta.objectPropertyFormats.YEAR_MONTH:
            case meta.objectPropertyFormats.DATE_ISO:
                return 'Date';
            case meta.objectPropertyFormats.SHORT_TIME:
            case meta.objectPropertyFormats.LONG_TIME:
                return 'Time';
            case meta.objectPropertyFormats.LONG_DATE_SHORT_TIME:
            case meta.objectPropertyFormats.LONG_DATE_LONG_TIME:
            case meta.objectPropertyFormats.SHORT_DATE_SHORT_TIME:
            case meta.objectPropertyFormats.SHORT_DATE_LONG_TIME:
            case meta.objectPropertyFormats.CONDENSED_DATE_SHORT_TIME:
            case meta.objectPropertyFormats.DATE_TIME_ISO:
                return 'DateTime';
            default:
                return 'DateTime';
        }
    },

    getDateDisplayFormat(attributeFormat) {
        switch (attributeFormat) {
            case meta.objectPropertyFormats.SHORT_DATE:
            case meta.objectPropertyFormats.SHORT_DATE_SHORT_TIME:
            case meta.objectPropertyFormats.SHORT_DATE_LONG_TIME:
                return Localizer.get(`${formatLocalisePrefix}.SHORTDATE`);
            case meta.objectPropertyFormats.LONG_DATE:
            case meta.objectPropertyFormats.LONG_DATE_SHORT_TIME:
            case meta.objectPropertyFormats.LONG_DATE_LONG_TIME:
                return Localizer.get(`${formatLocalisePrefix}.LONGDATE`);
            case meta.objectPropertyFormats.CONDENSED_DATE:
            case meta.objectPropertyFormats.CONDENSED_DATE_SHORT_TIME:
                return Localizer.get(`${formatLocalisePrefix}.CONDENSEDDATE`);
            case meta.objectPropertyFormats.MONTH_DAY:
                return Localizer.get(`${formatLocalisePrefix}.MONTHDAY`);
            case meta.objectPropertyFormats.YEAR_MONTH:
                return Localizer.get(`${formatLocalisePrefix}.YEARMONTH`);
            case meta.objectPropertyFormats.DATE_ISO:
            case meta.objectPropertyFormats.DATE_TIME_ISO:
                return Localizer.get(`${formatLocalisePrefix}.DATEISO`);
            default:
                return null;
        }
    },
    getTimeDisplayFormat(attributeFormat) {
        switch (attributeFormat) {
            case meta.objectPropertyFormats.SHORT_TIME:
            case meta.objectPropertyFormats.LONG_DATE_SHORT_TIME:
            case meta.objectPropertyFormats.SHORT_DATE_SHORT_TIME:
            case meta.objectPropertyFormats.CONDENSED_DATE_SHORT_TIME:
                return Localizer.get(`${formatLocalisePrefix}.SHORTTIME`);
            case meta.objectPropertyFormats.LONG_TIME:
            case meta.objectPropertyFormats.LONG_DATE_LONG_TIME:
            case meta.objectPropertyFormats.SHORT_DATE_LONG_TIME:
            case meta.objectPropertyFormats.DATE_TIME_ISO:
                return Localizer.get(`${formatLocalisePrefix}.LONGTIME`);
            default:
                return null;
        }
    },

    getDurationDisplayOptions(model) {
        const format = model.get('dataSourceInfo').format;

        const configuration = {
            showEmptyParts: model.get('showEmptyParts'),
            min: model.get('minDuration'),
            max: model.get('maxDuration')
        };
        let clientDurationFormat = null;

        switch (format) {
            case meta.objectPropertyFormats.D_H_M_S:
                clientDurationFormat = {
                    allowDays: true,
                    allowHours: true,
                    allowMinutes: true,
                    allowSeconds: true
                };
                break;
            case meta.objectPropertyFormats.H_M_S:
                clientDurationFormat = {
                    allowDays: false,
                    allowHours: true,
                    allowMinutes: true,
                    allowSeconds: true
                };
                break;
            case meta.objectPropertyFormats.H_M:
                clientDurationFormat = {
                    allowDays: false,
                    allowHours: true,
                    allowMinutes: true,
                    allowSeconds: false
                };
                break;
            case meta.objectPropertyFormats.FULL_LONG:
            case meta.objectPropertyFormats.ISO:
            case meta.objectPropertyFormats.INVARIANT:
            default:
                break;
        }

        return Object.assign({}, configuration, clientDurationFormat);
    },

    getNumberDisplayOptions(options = {}) { //options - dsi
        const attributeFormat = options.format;
        const useGrouping = options.isDigitGrouping !== undefined ? options.isDigitGrouping : true;
        switch (attributeFormat) {
            case meta.objectPropertyFormats.INTEGER:
                return {
                    allowFloat: false,
                    intlOptions: {
                        minimumFractionDigits: 0,
                        useGrouping
                    }
                };
            case meta.objectPropertyFormats.DECIMAL:
                return {
                    allowFloat: true,
                    intlOptions: {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 3,
                        useGrouping
                    }
                };
            case meta.objectPropertyFormats.CURRENCY:
                return {
                    allowFloat: true,
                    intlOptions: {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                        useGrouping
                    }
                };
            default:
                return {};
        }
    }
};
