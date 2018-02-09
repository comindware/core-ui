
import { moment } from 'lib';

export default function(date) {
    return moment(date).format('ll');
}
