/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
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
