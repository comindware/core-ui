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
        './views/NativeGridView',
        'core/collections/VirtualCollection'
    ],
    function (
        utils, NativeGridView, VirtualCollection

    ) {
        'use strict';

        var createWrappedCollection = function (collection, options) {
            if (!(collection instanceof VirtualCollection)) {
                if (_.isArray(collection)) {
                    collection = new VirtualCollection(new Backbone.Collection(collection), options);
                } else if (collection instanceof Backbone.Collection) {
                    collection = new VirtualCollection(collection, options);
                } else {
                    utils.helpers.throwError('Invalid collection', 'ArgumentError');
                }
            }
            return collection;
        };

        return {
            createNativeGrid: function (options) {
                var collection = createWrappedCollection(options.collection, {selectableBehavior: options.gridViewOptions.selectableBehavior});

                var gridViewOptions = _.extend({
                    columnsFit: options.columnsFit,
                    collection: collection,
                    onColumnSort: options.onColumnSort,
                    rowView: options.rowView
                }, options.gridViewOptions);

                return new NativeGridView(gridViewOptions);
            }
        };

    }
);