/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        'core/utils/utilsApi',
        './views/NativeGridView'

    ],
    function (
        utils, NativeGridView

    ) {
        'use strict';

        return {
            createNativeGrid: function (options) {
                var gridViewOptions = _.extend({
                    columnsFit: options.columnsFit,
                    collection: options.collection
                }, options.gridViewOptions);

                return new NativeGridView(gridViewOptions);
            }
        };

    }
);