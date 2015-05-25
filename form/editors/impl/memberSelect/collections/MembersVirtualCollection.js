/**
 * Developer: Stepan Burguchev
 * Date: 1/29/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        '../models/MemberModel',
        'core/list/listApi',
        'core/utils/utilsApi',
        'core/collections/VirtualCollection',
        'core/collections/behaviors/HighlightableBehavior'
    ],
    function (MemberModel, list, utils, VirtualCollection, HighlightableBehavior) {
        'use strict';

        return VirtualCollection.extend({
            initialize: function () {
                utils.applyBehavior(this, HighlightableBehavior);
            },

            model: MemberModel
        });
    });
