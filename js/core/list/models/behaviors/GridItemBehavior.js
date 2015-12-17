/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, _, classes */

define([
        'core/utils/utilsApi',
        'core/models/behaviors/SelectableBehavior',
        'core/models/behaviors/HighlightableBehavior'
    ],
    function (utils, SelectableBehavior, HighlightableBehavior) {
        'use strict';

        return function (model) {
            _.extend(this, new SelectableBehavior.Selectable(model));
            _.extend(this, new HighlightableBehavior(model));
        };
    });
