/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, classes, _ */

define([
        'core/models/behaviors/CollapsibleBehavior',
        'core/libApi'
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
