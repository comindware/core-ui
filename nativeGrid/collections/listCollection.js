/**
 * Developer: Grigory Kuznetsov
 * Date: 18.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib'],
    function (lib) {
        'use strict';

        var ListCollection = Backbone.Collection.extend({
            constructor: function (collection, options) //noinspection JSHint
            {
                options = options || {};
                this.parentCollection = collection;
                this.innerCollection = new Backbone.Collection();

                //noinspection JSUnresolvedVariable,JSHint
                options.close_with && this.__bindLifecycle(options.close_with, 'close');
                //noinspection JSUnresolvedVariable,JSHint
                options.destroy_with && this.__bindLifecycle(options.destroy_with, 'destroy');

                this.__rebuildModels();

                this.listenTo(collection, 'add', this.__onAdd);
                this.listenTo(collection, 'remove', this.__onRemove);
                this.listenTo(collection, 'reset',  this.__onReset);
                this.listenTo(collection, 'sort',  this.__onSort);

                _.each([
                    'add',
                    'remove',
                    'reset',
                    'sort'
                ], function (eventName)
                {
                    this.listenTo(this.innerCollection, eventName, function () {
                        var args = _.toArray(arguments);
                        args.unshift(eventName);
                        this.trigger.apply(this, args);
                    });
                }, this);

                this.initialize.apply(this, arguments);
            },

            __rebuildModels: function (options) {
                options = options || {};
                var newModels = this.parentCollection.chain().value();
                this.innerCollection.reset(newModels, _.extend(options, { silent: true }));
                this.models = this.innerCollection.models;
                this.length = this.innerCollection.length;
                this.trigger('reset', this, _.clone(options));
                if (this.models.length !== newModels.length) {
                    throw new Error('ListCollection size mismatch: does parent collection have models with duplicated id?');
                }
            },

            __bindLifecycle: function (view, methodName) {
                view.on(methodName, _.bind(this.stopListening, this));
            },

            __onSort: function (collection, options) {
                this.__rebuildModels(options);
            },

            __onAdd: function (model, collection, options) {
                this.__rebuildModels(options);
            },

            __onRemove: function (model, collection, options) {
                this.__rebuildModels(options);
            },

            __onReset: function (collection, options) {
                this.__rebuildModels(options);
            },

            sort: function (options)
            {
                this.parentCollection.sort(options);
            }
        });

        // methods that alter data should proxy to the parent collection
        _.each(['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch'], function (methodName) {
            ListCollection.prototype[methodName] = function () {
                return this.parentCollection[methodName].apply(this.parentCollection, _.toArray(arguments));
            };
        });

        // methods that retrieves data should proxy to the inner collection
        _.each(['each', 'at', 'get', 'filter', 'map'], function (methodName) {
            ListCollection.prototype[methodName] = function () {
                return this.innerCollection[methodName].apply(this.innerCollection, _.toArray(arguments));
            };
        });

        _.extend(ListCollection.prototype, Backbone.Events);

        return ListCollection;
    });
