/**
 * Developer: Stepan Burguchev
 * Date: 12/12/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'module/lib',
        'core/list/listApi',
        'core/utils/utilsApi',
        '../models/SearchMoreModel'
    ],
    function (lib, list, utils, SearchMoreModel) {
        'use strict';

        return Marionette.Controller.extend({
            initialize: function (options) {
                utils.helpers.ensureOption(options, 'collection');

                this.originalCollection = options.collection;
                this.collection = list.factory.createWrappedCollection(options.collection);
            },

            fetch: function (options) {
                options = options || {};
                var deferred = $.Deferred();
                var promise = deferred.promise();

                var filterText = options.text ? options.text.trim().toUpperCase() : '';
                if (filterText.indexOf(this.activeFilterText) && this.totalCount) {
                    // Client-side filter
                    if (filterText) {
                        this.collection.filter(function (model) {
                            if (model instanceof SearchMoreModel) {
                                return true;
                            }
                            var text = model.get('text');
                            if (!text) {
                                return false;
                            }
                            return text.toUpperCase().indexOf(filterText) !== -1;
                        });
                    } else {
                        this.collection.filter(null);
                    }
                    deferred.resolve();
                } else {
                    // Server-side filter or new data request
                    this.collection.filter(null);
                    this.collection.fetch({
                        data: {
                            filter: filterText
                        },
                        success: function () {
                            if (promise !== this.fetchPromise) {
                                deferred.reject();
                                return;
                            }

                            this.totalCount = this.collection.totalCount;
                            this.activeFilterText = filterText;
                            deferred.resolve();
                            this.fetchPromise = null;
                        }.bind(this)
                    });
                }

                this.fetchPromise = promise;
                return this.fetchPromise;
            },

            navigate: function (model) {
                utils.helpers.throwError('Not Implemented.', 'NotImplementedError');
            }
        });
    });
