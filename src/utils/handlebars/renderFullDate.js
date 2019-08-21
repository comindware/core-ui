import { DateTime } from 'luxon';

export default function(date) {
    return DateTime.fromISO(date).toFormat('ll');
}
