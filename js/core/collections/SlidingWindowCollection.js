/**
 * Developer: Stepan Burguchev
 * Date: 7/18/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, _ */

define(['core/libApi'],
    function () {
        'use strict';

        /**
         * @name SlidingWindowCollection
         * @memberof module:core.collections
         * @class Коллекция-обертка, отображающая указанный интервал родительской Backbone-коллекции (скользящее окно).
         * @constructor
         * @extends Backbone.Collection
         * @param {Object} options Объект опций.
         * @param {Number} [options.position=0] Изначальное значении позиции окна.
         * @param {Number} [options.windowSize=0] Изначальное значение размера окна (количество элементов).
         * */

        var SlidingWindowCollection = Backbone.Collection.extend(/** @lends module:core.collections.SlidingWindowCollection.prototype */ {
            constructor: function (collection, options) //noinspection JSHint
            {
                options = options || {};
                this.parentCollection = collection;
                this.innerCollection = new Backbone.Collection();

                //noinspection JSUnresolvedVariable,JSHint
                options.close_with && this.__bindLifecycle(options.close_with, 'close');
                //noinspection JSUnresolvedVariable,JSHint
                options.destroy_with && this.__bindLifecycle(options.destroy_with, 'destroy');

                this.state = {
                    position: options.position || 0,
                    windowSize: options.windowSize || 0
                };

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
                var newModels = this.parentCollection.chain().rest(this.state.position).first(this.state.windowSize).value();
                this.innerCollection.reset(newModels, _.extend(options, { silent: true }));
                this.models = this.innerCollection.models;
                this.length = this.innerCollection.length;
                this.trigger('reset', this, _.clone(options));
                if (this.models.length !== newModels.length) {
                    throw new Error('SlidingWindowCollection size mismatch: does parent collection have models with duplicated id?');
                }
            },

            __buildModelsInternal: function (list)
            {
                for (var i = 0, len = list.length; i < len; i++) {
                    var model = list.at(i);
                    this.models.push(model);
                    model.collection = this;
                    this._byId[model.cid] = model;
                    if (model.id) {
                        this._byId[model.id] = model;
                    }
                    //noinspection JSHint
                    !model.collapsed && model.children && this.__buildModelsInternal(model.children);
                }
                this.length = this.models.length;
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
            },

            /**
             * Обновить размер скользящего окна
             * @param {Number} newWindowSize Новый размер скользящего окна
             * */
            updateWindowSize: function (newWindowSize)
            {
                if (this.state.windowSize !== newWindowSize) {
                    this.state.windowSize = newWindowSize;
                    this.__rebuildModels();
                }
            },

            /**
             * Обновить позицию скользящего окна
             * @param {Number} newPosition Новая позиция скользящего окна
             * */
            updatePosition: function (newPosition)
            {
                if (this.state.windowSize === undefined) {
                    throw 'updatePosition() has been called before setting window size';
                }

                newPosition = this.__normalizePosition(newPosition);
                if (newPosition === this.state.position) {
                    return newPosition;
                }

                var actualWindowSize = this.innerCollection.length;
                var delta = newPosition - this.state.position;
                var oldValues;
                var newValues;
                if (Math.abs(delta) < actualWindowSize) {
                    // update collection via add/remove
                    if (delta > 0) {
                        oldValues = this.innerCollection.first(delta);
                        this.length -= oldValues.length;
                        this.innerCollection.remove(oldValues);
                        newValues = this.parentCollection.chain().rest(this.state.position + actualWindowSize).first(delta).value();
                        this.length += newValues.length;
                        this.innerCollection.add(newValues);
                    } else {
                        if (this.length >= this.state.windowSize) {
                            oldValues = this.innerCollection.last(-delta);
                            this.length -= oldValues.length;
                            this.innerCollection.remove(oldValues);
                        }

                        newValues = this.parentCollection.chain().rest(newPosition).first(-delta).value();
                        this.length += newValues.length;
                        this.innerCollection.add(newValues, {
                            at: 0
                        });
                    }
                    this.state.position = newPosition;
                } else {
                    this.state.position = newPosition;
                    this.__rebuildModels();
                }

                return newPosition;
            },

            __normalizePosition: function (position)
            {
                var maxPos = Math.max(0, this.parentCollection.length - 1);
                return Math.max(0, Math.min(maxPos, position));
            }
        });

        // methods that alter data should proxy to the parent collection
        _.each(['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch'], function (methodName) {
            SlidingWindowCollection.prototype[methodName] = function () {
                return this.parentCollection[methodName].apply(this.parentCollection, _.toArray(arguments));
            };
        });

        // methods that retrieves data should proxy to the inner collection
        _.each(['each', 'at', 'get', 'filter', 'map'], function (methodName) {
            SlidingWindowCollection.prototype[methodName] = function () {
                return this.innerCollection[methodName].apply(this.innerCollection, _.toArray(arguments));
            };
        });

        _.extend(SlidingWindowCollection.prototype, Backbone.Events);

        return SlidingWindowCollection;
    });
