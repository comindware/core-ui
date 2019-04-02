import dateHelpers from '../dateHelpers';

export default function(date, formatName, formatPart) {
    return date ?
        moment(date).format(dateHelpers.getFormat(formatName, formatPart)) :
        Localizer.get('CORE.COMMON.NOTSET');
}
