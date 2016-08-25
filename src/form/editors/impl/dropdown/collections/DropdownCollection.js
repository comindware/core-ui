/**
 * Developer: Grigory Kuznetsov
 * Date: 22.09.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import VirtualCollection from '../../../../../collections/VirtualCollection';
import HighlightableBehavior from '../../../../../collections/behaviors/HighlightableBehavior';

export default VirtualCollection.extend({
    initialize: function () {
        helpers.applyBehavior(this, HighlightableBehavior);
    }
});
