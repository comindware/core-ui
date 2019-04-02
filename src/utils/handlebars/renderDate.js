import dateHelpers from '../dateHelpers';

export default function(date, formatName) {
    return date ?
        moment(date).format(dateHelpers.getFormat(formatName)) :
        Localizer.get('CORE.COMMON.NOTSET');
}
