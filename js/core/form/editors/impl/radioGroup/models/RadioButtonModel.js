/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        'core/libApi',
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
