/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.12.2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers, comparators } from 'utils';
import VirtualCollection from '../../../../../../collections/VirtualCollection';
import HighlightableBehavior from '../../../../../../collections/behaviors/HighlightableBehavior';
import MemberModel from '../models/MemberModel';

export default VirtualCollection.extend({
    initialize: function () {
        helpers.applyBehavior(this, HighlightableBehavior);
    },

    model: MemberModel,

    comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name'),

    applyTextFilter: function (text) {
        this.deselect();
        this.unhighlight();

        if(!text) {
            this.filter(null);
            this.selectFirst();
            return;
        }
        text = text.toLowerCase();
        this.filter(function (model) {
            return model.matchText(text);
        });
        this.highlight(text);
        this.selectFirst();
    },

    selectFirst: function () {
        if (this.length > 0) {
            this.at(0).select();
        }
    }
});
