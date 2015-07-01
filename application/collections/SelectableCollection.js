/**
 * Developer: Stepan Burguchev
 * Date: 7/1/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _, Localizer */

define([
        'module/lib',
        'core/utils/utilsApi',
        'core/models/behaviors/SelectableBehavior',
        '../models/SelectableModel'
    ],
    function (lib, utilsApi, SelectableBehavior, SelectableModel) {
        'use strict';

        return Backbone.Collection.extend({
            initialize: function () {
                utilsApi.helpers.applyBehavior(this, SelectableBehavior.SingleSelect);
            },

            model: SelectableModel
        });
    });
