/**
 * Developer: Stepan Burguchev
 * Date: 12/10/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'core/libApi',
        'core/list/listApi',
        'core/utils/utilsApi',
        '../models/SearchMoreModel',
        '../models/DefaultReferenceModel'
    ],
    function (lib, list, utils, SearchMoreModel, DefaultReferenceModel) {
        'use strict';

        var config = {
            DEFAULT_COUNT: 200
        };

        var createDemoData = function () {
            return _.times(1000, function (i) {
                var id = 'task.' + (i + 1);
                return {
                    id: id,
                    text: 'Test Reference ' + (i + 1)
                };
            });
        };

        var DemoReferenceCollections = Backbone.Collection.extend({
            model: DefaultReferenceModel
        });

        return Marionette.Controller.extend({
            initialize: function (options) {
                this.collection = list.factory.createWrappedCollection(new DemoReferenceCollections([]));
            },

            fetch: function (options) {
                options = options || {};
                var deferred = $.Deferred();
                var promise = deferred.promise();
                setTimeout(function () {
                    if (promise !== this.fetchPromise) {
                        deferred.reject();
                        return;
                    }

                    this.collection.reset(createDemoData());
                    if (options.text) {
                        var filterText = options.text.trim().toUpperCase();
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
                    } else {
                        this.collection.filter(null);
                    }

                    this.totalCount = 123123;
                    deferred.resolve();
                    this.fetchPromise = null;
                }.bind(this), 1000);
                this.fetchPromise = promise;
                return this.fetchPromise;
            },

            navigate: function (model) {
                utils.helpers.throwError('Not Implemented.', 'NotImplementedError');
            }
        });
    });
