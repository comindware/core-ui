const formatLocalisePrefix = 'CORE.FORMATS.MOMENT';

export const getClasses = function getClasses() {
    return {
        dateMapClasses: {
            [Localizer.get(`${formatLocalisePrefix}.SHORTDATE`)]: 'ShortDate',
            [Localizer.get(`${formatLocalisePrefix}.LONGDATE`)]: 'LongDate',
            [Localizer.get(`${formatLocalisePrefix}.CONDENSEDDATE`)]: 'CondensedDate',
            [Localizer.get(`${formatLocalisePrefix}.YEARMONTH`)]: 'YearMonth',
            [Localizer.get(`${formatLocalisePrefix}.DATEISO`)]: 'DateIso'
        },
        timeMapClasses: {
            [Localizer.get(`${formatLocalisePrefix}.SHORTTIME`)]: 'ShortTime',
            [Localizer.get(`${formatLocalisePrefix}.LONGTIME`)]: 'LongTime'
        }
    };
};

export default getClasses;
