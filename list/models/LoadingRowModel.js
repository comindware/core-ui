/**
 * Developer: Grigory Kuznetsov
 * Date: 27.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _, Localizer */

define(['core/libApi'],
    function (lib) {
        'use strict';
        /**
         * Some description for initializer
         * @name LoadingRowModel
         * @memberof module:core.list.models
         * @class LoadingRowModel
         * @constructor
         * @description Model строки списка
         * @extends Backbone.Model
         * */
        return Backbone.Model.extend({
            initialize: function () {
            },

            defaults: {
                isLoadingRowModel: true
            }
        });
    });
