/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.12.2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/*eslint-disable*/

import { helpers, comparators } from 'utils';
import VirtualCollection from '../../../../../collections/VirtualCollection';
import MemberModel from '../models/MemberModel';

export default VirtualCollection.extend({
    model: MemberModel,

    comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name'),

    applyTextFilter(text) {
        this.deselect();
        this.unhighlight();

        if (!text) {
            this.filter(null);
            this.selectFirst();
            return;
        }
        text = text.toLowerCase();
        this.filter(model => model.matchText(text));
        this.highlight(text);
        this.selectFirst();
    },

    selectFirst() {
        if (this.length > 0) {
            this.at(0).select();
        }
    }
});
