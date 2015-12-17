/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.05.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Backbone, Marionette, $, _ */

define(['core/libApi'],
    function () {
        'use strict';
        return Backbone.Model.extend({

            updateEmpty: function () {
                this.set('empty', this.collection.models.length == 1);
            }
        });
    });
