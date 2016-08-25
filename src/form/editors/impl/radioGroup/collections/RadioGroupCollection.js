/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import SelectableBehavior from '../../../../../models/behaviors/SelectableBehavior';
import RadioButtonModel from '../models/RadioButtonModel';

export default Backbone.Collection.extend({
    initialize: function () {
        helpers.applyBehavior(this, SelectableBehavior.SingleSelect);
    },

    model: RadioButtonModel
});
