/**
 * Developer: Stepan Burguchev
 * Date: 7/18/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import SelectableBehavior from '../models/behaviors/SelectableBehavior';
import { helpers } from '../utils/utilsApi';

let selectableBehavior = {
    'none': null,
    'single': SelectableBehavior.SingleSelect,
    'multi': SelectableBehavior.MultiSelect
};

let getNormalizedGroupingIterator = function getNormalizedGroupingIterator(groupingOptions) {
    var it = groupingOptions.iterator;
    return _.isString(it) ? function (model) {
        return model.get(it) || model[it];
    } : it;
};

let getNormalizedGroupingComparator = function getNormalizedGroupingComparator(groupingOptions) {
    var cmp = groupingOptions.comparator;
    return cmp !== undefined ?
        (_.isString(cmp) ? function (model) {
            return model.get(cmp) || model[cmp];
        } : cmp) :
        groupingOptions.iterator;
};

let getNormalizedGroupingModelFactory = function getNormalizedGroupingModelFactory(groupingOptions) {
    var modelFactory = groupingOptions.modelFactory;
    return modelFactory !== undefined ?
        (_.isString(modelFactory) ?
            function (model) {
                return new Backbone.Model({
                    displayText: model.get(modelFactory),
                    groupingModel: true
                });
            } : modelFactory) :
        function (model) {
            return new Backbone.Model({
                displayText: groupingOptions.iterator(model),
                groupingModel: true
            });
        };
};

let fixGroupingOptions = function fixGroupingOptions(groupingOptions) {
    if (groupingOptions.__normalized) {
        return;
    }
    if (!groupingOptions.affectedAttributes) {
        groupingOptions.affectedAttributes = [];
    }
    if (_.isString(groupingOptions.iterator)) {
        groupingOptions.affectedAttributes.push(groupingOptions.iterator);
    }
    if (_.isString(groupingOptions.comparator)) {
        groupingOptions.affectedAttributes.push(groupingOptions.comparator);
    }
    if (_.isString(groupingOptions.modelFactory)) {
        groupingOptions.affectedAttributes.push(groupingOptions.modelFactory);
    }
    groupingOptions.affectedAttributes = _.uniq(groupingOptions.affectedAttributes);

    groupingOptions.iterator = getNormalizedGroupingIterator(groupingOptions);
    groupingOptions.comparator = getNormalizedGroupingComparator(groupingOptions);
    groupingOptions.modelFactory = getNormalizedGroupingModelFactory(groupingOptions);
    groupingOptions.__normalized = true;
};

/**
 * @name VirtualCollection
 * @memberof module:core.collections
 * @class Коллекция-обертка, раширяющая родительскую Backbone-коллекцию функциями
 * фильтрация, группировка (включая вложенную группировку и сворачивание групп), древовидное представление.<br/><br/>
 * Используется в качестве модели данных для контролов виртуального списка и таблицы (<code>core.list</code>).<br/><br/>
 * Оптимизировано для корректной работы с коллекцией до 100000 элементов.
 * @constructor
 * @extends Backbone.Collection
 * @param {Backbone.Collection} collection Родительская Backbone-коллекция.
 * @param {Object} options Объект опций.
 * @param {Boolean} [options.delayedAdd=true] Добавление новой модели в коллекцию требует пересчета внутреннего индекса.
 * Из этого следует, что добавление множества моделей приводит к резкому снижению производительности.
 * Данная опция позволяет отложить пересчет индекса до окончания активного события.
 * @param {Function} options.comparator Функция-компаратор.
 * @param {Object} options.grouping .
 * @param {Object} options.filter .
 * @param {Backbone.Model} options.model Если указано, будет использована как Backbone.Model при добавление новых объектов в формате JSON.
 * По умолчанию используется модель родительской коллекции.
 * @param {String} [options.selectableBehavior='single'] Позволяет расширить коллекцию объектом SelectableBehavior.
 * Используемая модель также должна поддерживать SelectableBehavior.<br/>
 * Возможные варианты:<ul>
 *     <li><code>'none'</code> - не использовать selectable behavior.</li>
 *     <li><code>'single'</code> - использовать SelectableBehavior.SingleSelect.</li>
 *     <li><code>'multi'</code> - использовать SelectableBehavior.MultiSelect.</li>
 * </ul>.
 * */

let VirtualCollection = Backbone.Collection.extend(/** @lends module:core.collections.VirtualCollection.prototype */ {
    constructor: function (collection, options) //noinspection JSHint
    {
        options = options || {};
        this.options = options;
        this.syncRoot = _.uniqueId('virtual-collection-');
        if (options.delayedAdd === undefined) {
            options.delayedAdd = true;
        }
        if (!collection) {
            collection = new Backbone.Collection();
            if (this.model) {
                collection.model = this.model;
            }
        }
        if (this.url && !collection.url) {
            collection.url = this.url;
        }
        if (this.parse !== Backbone.Collection.prototype.parse) {
            collection.parse = this.parse;
        }
        this.parentCollection = collection;

        if (options.comparator !== undefined) {
            this.comparator = options.comparator;
        }

        if (options.grouping !== undefined) {
            this.grouping = options.grouping;
        }

        if (options.filter !== undefined) {
            this.filterFn = options.filter;
        }

        //noinspection JSUnresolvedVariable,JSHint
        options.close_with && this.__bindLifecycle(options.close_with, 'close');
        //noinspection JSUnresolvedVariable,JSHint
        options.destroy_with && this.__bindLifecycle(options.destroy_with, 'destroy');

        if (options.model) {
            this.model = options.model;
        } else if (collection.model) {
            this.model = collection.model;
        }

        this.__rebuildIndex();

        this.listenTo(collection, 'add', this.__onAdd);
        this.listenTo(collection, 'remove', this.__onRemove);
        this.listenTo(collection, 'change', this.__onChange);
        this.listenTo(collection, 'reset',  this.__onReset);
        this.listenTo(collection, 'sort',  this.__onSort);
        this.listenTo(collection, 'sync',  this.__onSync);

        this.initialize.apply(this, arguments);

        var SelectableBehaviorClass;
        var selectableBehaviorOption = this.options.selectableBehavior;
        if (selectableBehaviorOption && selectableBehavior[selectableBehaviorOption] !== undefined) {
            SelectableBehaviorClass = selectableBehavior[selectableBehaviorOption];
        } else {
            SelectableBehaviorClass = selectableBehavior.single;
        }
        if (SelectableBehaviorClass) {
            _.extend(this, new SelectableBehaviorClass(this));
        }
    },

    __rebuildIndex: function () {
        var tStart;
        if (window.flag_debug) {
            //noinspection JSUnresolvedVariable
            tStart = window.performance.now && window.performance.now();
        }

        var parentModels = this.filterFn ?
            _.filter(this.parentCollection.models, this.filterFn) :
            this.parentCollection.models;
        this.index = this.__createIndexTree(parentModels, 0);
        this.__rebuildModels();

        if (window.flag_debug) {
            //noinspection JSUnresolvedVariable
            var tEnd = window.performance.now && window.performance.now();
            //noinspection JSHint
            console.log("Call to __rebuildIndex took " + (tEnd - tStart) + " milliseconds.");
        }
    },

    __rebuildModels: function () {
        this._reset();
        this.__buildModelsInternal(this.index);
    },

    __buildModelsInternal: function (list)
    {
        for (var i = 0, len = list.length; i < len; i++) {
            var model = list.at(i);
            this.models.push(model);
            this._addReference(model);
            model.collection = this;
            //noinspection JSHint
            !model.collapsed && model.children && this.__buildModelsInternal(model.children);
        }
        this.length = this.models.length;
    },

    __createIndexTree: function (models, i) {
        var self = this;
        if (i < this.grouping.length) {
            var groupingOptions = this.grouping[i];
            fixGroupingOptions(groupingOptions);

            return new Backbone.Collection(_.chain(models)
                .groupBy(groupingOptions.iterator)
                .map(function (v) {
                    var node = groupingOptions.modelFactory(v[0], v);
                    node.iteratorValue = groupingOptions.iterator(v[0]);
                    node.comparatorValue = groupingOptions.comparator(v[0], v);
                    node.children = self.__createIndexTree(v, i + 1);
                    return node;
                })
                .sortBy(function (n) {
                    return n.comparatorValue;
                })
                .value());
        } else {
            // Applying comparator to the ultimate items
            if (!this.comparator) {
                return new Backbone.Collection(models);
            }

            // Run sort based on type of `comparator`.
            if (_.isString(this.comparator) || this.comparator.length === 1) {
                models = _.sortBy(models, this.comparator, this);
            } else {
                models.sort(_.bind(this.comparator, this));
            }

            _.each(models, function (model)
            {
                if (model.children && !model.children.comparator) {
                    model.children.comparator = this.comparator;
                    model.children.sort();
                }
            }, this);

            return new Backbone.Collection(models);
        }
    },

    filter: function (filterFn)
    {
        if (filterFn !== undefined) {
            this.filterFn = filterFn;
        }

        this.__rebuildIndex();
        this.trigger('reset', this, {});
    },

    group: function (grouping)
    {
        if (grouping !== undefined) {
            this.grouping = grouping;
        }

        this.__rebuildIndex();
        this.trigger('reset', this, {});
    },

    __bindLifecycle: function (view, methodName) {
        view.on(methodName, _.bind(this.stopListening, this));
    },

    grouping: [
    ],

    __onSort: function (collection, options) {
        if (this.comparator !== undefined) {
            return;
        }

        this.__rebuildIndex();
        this.trigger('reset', this, options);
    },

    __onSync: function (collection, resp, options) {
        this.trigger('sync', collection, resp, options);
    },

    __onAddDelayed: _.debounce(function (options) {
        this.__rebuildIndex();
        this.trigger('reset', this, options);
    }, 10),

    __onAdd: function (model, collection, options) {
        if (options.at !== undefined) {
            // Updating index
            var addToIndex = function (ctx, list) {
                for (var i = 0, len = list.length; i < len; i++) {
                    if (ctx.position === ctx.targetPosition) {
                        list.add(ctx.model, { at: i });
                        return true;
                    }
                    ctx.position++;
                    var indexModel = list.at(i);
                    if (indexModel.children && addToIndex(ctx, indexModel.children)) {
                        return true;
                    }
                }
            };
            var added = addToIndex({ position: 0, targetPosition: options.at, model: model }, this.index);
            if (!added) {
                // border case when at === this.length
                var targetCollection = this.index;
                while (targetCollection.length > 0 && targetCollection.at(targetCollection.length - 1).children) {
                    targetCollection = targetCollection.at(targetCollection.length - 1).children;
                }
                targetCollection.add(model, { at: targetCollection.length });
            }
            // Updating models
            this.__rebuildModels();

            this.trigger('reset', this, options);
            return;
        }

        if (options.delayed !== false && this.options.delayedAdd) {
            this.__onAddDelayed(options);
        } else {
            this.__rebuildIndex();
            this.trigger('reset', this, options);
        }
    },

    __onRemove: function (model, collection, options) {
        var i;
        var len;
        options || (options = {}); // jshint ignore:line

        // collecting items in index
        function createIteratorValueChecker(iteratorValue) {
            return function (m) {
                return m.iteratorValue == iteratorValue; // jshint ignore:line
            };
        }
        var index = this.index;
        var groupItems = [];
        if (this.grouping) {
            for (i = 0, len = this.grouping.length; i < len; i++) {
                var groupingOptions = this.grouping[i];
                var groupItem = index.filter(createIteratorValueChecker(groupingOptions.iterator(model)))[0];
                if (!groupItem) {
                    return;
                }
                groupItems.push(groupItem);
                index = groupItem.children;
            }
        }

        var item = index.get(model);
        if (item) {
            index.remove(item);
            this.__removeFromModels(item, _.extend(options, { silent: true }));
        }

        for (i = groupItems.length - 1; i >= 0; i--) {
            item = groupItems[i];
            index = groupItems[i - 1] || this.index;
            if (item.children.length === 0) {
                index.remove(item);
                this.__removeFromModels(item, _.extend(options, { silent: true }));
            }
        }

        this.__rebuildModels();
        this.trigger('reset', this, options);
    },

    __removeFromModels: function (model, options)
    {
        if (!this.get(model)) {
            return;
        }

        delete this._byId[model.id];
        delete this._byId[model.cid];
        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
            options.index = index;
            model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
    },

    __onChange: function (model, options) {
        var changed = _.keys(model.changedAttributes());
        var attrsAffectedByGrouping = [];
        _.each(this.grouping, function (o) {
            if (o.affectedAttributes) {
                for (var i = 0, len = o.affectedAttributes.length; i < len; i++) {
                    attrsAffectedByGrouping.push(o.affectedAttributes[i]);
                }
            }
        });

        var rebuildRequired = _.any(changed, function (key) {
            return attrsAffectedByGrouping.indexOf(key) !== -1;
        });

        if (!rebuildRequired && this.comparator) {
            var previousModel = new model.constructor(model.previousAttributes(), model.options);
            if (this.comparator.length === 1) {
                var cmpVal1 = this.comparator(previousModel);
                var cmpVal2 = this.comparator(model);
                rebuildRequired = cmpVal1 !== cmpVal2;
            } else if (this.comparator.length === 2) {
                rebuildRequired = this.comparator(previousModel, model) !== 0;
            }
        }

        if (rebuildRequired) {
            this.__rebuildIndex();
            this.trigger('reset', this, options);
        }
    },

    __onReset: function (collection, options) {
        this.__rebuildIndex();
        this.trigger('reset', this, options);
    },

    sort: function (options)
    {
        this.__rebuildIndex();
        this.trigger('reset', this, options);
    },

    collapse: function (model) {
        model.collapse(true);
        this.__rebuildModels();
        this.trigger('reset', this);
    },

    expand: function (model) {
        model.expand(true);
        this.__rebuildModels();
        this.trigger('reset', this);
    }
});

// methods that alter data should proxy to the parent collection
_.each(['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch'], function (methodName) {
    VirtualCollection.prototype[methodName] = function () {
        return this.parentCollection[methodName].apply(this.parentCollection, _.toArray(arguments));
    };
});

_.extend(VirtualCollection.prototype, Backbone.Events);

export default VirtualCollection;
