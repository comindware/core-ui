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

/* global define, require, classes, _ */

define([
        'core/models/behaviors/CollapsibleBehavior',
        'module/lib'
    ],
    function (CollapsibleBehavior) {
        'use strict';

        var ListGroupBehavior = function (model) {
            _.extend(this, new CollapsibleBehavior(model));
        };

        _.extend(ListGroupBehavior.prototype, {
            deselect: function ()
            {
            },

            select: function ()
            {
            }
        });

        return ListGroupBehavior;
    });
