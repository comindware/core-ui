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
        'core/models/behaviors/SelectableBehavior',
        '../models/RadioButtonModel'],
    function (lib, utils, SelectableBehavior, RadioButtonModel) {
        'use strict';

        return Backbone.Collection.extend({
            initialize: function () {
                utils.helpers.applyBehavior(this, SelectableBehavior.SingleSelect);
            },

            model: RadioButtonModel
        });
    });
