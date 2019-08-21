import dateHelpers from '../dateHelpers';
import { DateTime } from 'luxon';

export default function(date, formatName, formatPart) {
    return date ? DateTime.fromISO(date).toFormat(dateHelpers.getFormat(formatName, formatPart)) : Localizer.get('CORE.COMMON.NOTSET');
}
