/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { dateHelpers } from '../index';

export default function(duration) {
    if (duration === 0) {
        return '0';
    }
    if (!duration) {
        return '';
    }
    const o = dateHelpers.durationISOToObject(duration);
    let result = '';
    if (o.days) {
        result += `${o.days + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS')} `;
    }
    if (o.hours) {
        result += `${o.hours + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS')} `;
    }
    if (o.minutes) {
        result += `${o.minutes + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES')} `;
    }
    return result.trimRight();
}
