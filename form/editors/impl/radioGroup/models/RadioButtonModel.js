/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        'module/lib',
        'core/utils/utilsApi',
        'core/models/behaviors/SelectableBehavior'
    ],
    function (lib, utils, SelectableBehavior) {
        'use strict';

        return Backbone.Model.extend({
            initialize: function () {
                utils.helpers.applyBehavior(this, SelectableBehavior.Selectable);
            }
        });
    });
