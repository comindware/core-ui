/**
 * Developer: Stepan Burguchev
 * Date: 7/18/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */
/*eslint-disable*/
import 'lib';
import SelectableBehavior from '../models/behaviors/SelectableBehavior';
import CheckableBehavior from '../models/behaviors/CheckableBehavior';
import { helpers } from 'utils';

const selectableBehavior = {
    none: null,
    single: SelectableBehavior.SingleSelect,
    multi: SelectableBehavior.MultiSelect
};

const getNormalizedGroupingIterator = function getNormalizedGroupingIterator(groupingOptions) {
    const it = groupingOptions.iterator;
    return _.isString(it) ? function(model) {
        return model.get(it) || model[it];
    } : it;
};

const getNormalizedGroupingComparator = function getNormalizedGroupingComparator(groupingOptions) {
    const cmp = groupingOptions.comparator;
    return cmp !== undefined ?
        (_.isString(cmp) ? function(model) {
            return model.get(cmp) || model[cmp];
        } : cmp) :
        groupingOptions.iterator;
};

const getNormalizedGroupingModelFactory = function getNormalizedGroupingModelFactory(groupingOptions) {
    const modelFactory = groupingOptions.modelFactory;
    return modelFactory !== undefined ?
        (_.isString(modelFactory) ?
            function(model) {
                return new Backbone.Model({
                    displayText: model.get(modelFactory),
                    groupingModel: true
                });
            } : modelFactory) :
        function(model) {
            return new Backbone.Model({
                displayText: groupingOptions.iterator(model),
                groupingModel: true
            });
        };
};

const fixGroupingOptions = function fixGroupingOptions(groupingOptions) {
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

const VirtualCollection = Backbone.Collection.extend(/** @lends module:core.collections.VirtualCollection.prototype */ {
    constructor(collection, options = {}) {
        this.options = options;
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
        this.listenTo(collection, 'change', this.__onChange);
        this.listenTo(collection, 'reset', this.__onReset);
        this.listenTo(collection, 'sort', this.__onSort);
        this.listenTo(collection, 'sync', this.__onSync);
        this.listenTo(collection, 'update', this.__onUpdate);

        this.initialize.apply(this, arguments);

        let SelectableBehaviorClass;
        const selectableBehaviorOption = this.options.selectableBehavior;
        if (selectableBehaviorOption && selectableBehavior[selectableBehaviorOption] !== undefined) {
            SelectableBehaviorClass = selectableBehavior[selectableBehaviorOption];
        } else {
            SelectableBehaviorClass = selectableBehavior.single;
        }
        if (SelectableBehaviorClass) {
            Object.assign(this, new SelectableBehaviorClass(this));
        }
        Object.assign(this, new CheckableBehavior.CheckableCollection(this));
    },

    __rebuildIndex() {
        const parentModels = this.filterFn
            ? this.parentCollection.models.filter(this.filterFn)
            : this.parentCollection.models;

        this.index = this.__createIndexTree(parentModels, 0);
        this.__rebuildModels();
    },

    __rebuildModels() {
        this._reset();
        this.__buildModelsInternal(this.index);
    },

    __buildModelsInternal(list, level = 0) {
        for (let i = 0, len = list.length; i < len; i++) {
            const model = list.at(i);
            this._removeReference(model);
            this.models.push(model);
            this._addReference(model);
            model.collection = this;
            model.level = level;
            let skipChild = !this.options.isTree && model.collapsed;
            if (!skipChild && model.children) {
                if (this.options.isTree) {
                    this.listenToOnce(model.children, 'add', this.__onAdd);
                    this.listenToOnce(model.children, 'remove', this.__onRemove);
                    this.listenToOnce(model.children, 'reset', this.__onReset);
                }
                this.__buildModelsInternal(model.children, level + 1);
            }
        }
        this.length = this.models.length;
    },

    __createIndexTree(models, i) {
        const self = this;
        if (i < this.grouping.length) {
            const groupingOptions = this.grouping[i];
            fixGroupingOptions(groupingOptions);

            return new Backbone.Collection(_.chain(models)
                .groupBy(groupingOptions.iterator)
                .map(v => {
                    const node = groupingOptions.modelFactory(v[0], v);
                    node.iteratorValue = groupingOptions.iterator(v[0]);
                    node.comparatorValue = groupingOptions.comparator(v[0], v);
                    node.children = self.__createIndexTree(v, i + 1);
                    return node;
                })
                .sortBy(n => n.comparatorValue)
                .value());
        }
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

        models.forEach(model => {
            if (model.children && !model.children.comparator) {
                model.children.comparator = this.comparator;
                model.children.sort();
            }
            if (this.index) {
                this._removeReference(model);
            }
        });

        return new Backbone.Collection(models);
    },

    filter(filterFn) {
        if (filterFn !== undefined) {
            this.filterFn = filterFn;
        }

        this.__rebuildIndex();
        this.trigger('reset', this, {});
    },

    group(grouping) {
        if (grouping !== undefined) {
            this.grouping = grouping;
        }

        this.__rebuildIndex();
        this.trigger('reset', this, {});
    },

    __bindLifecycle(view, methodName) {
        view.on(methodName, _.bind(this.stopListening, this));
    },

    grouping: [
    ],

    __onSort(collection, options) {
        if (this.comparator !== undefined) {
            return;
        }

        this.__rebuildIndex();
        this.trigger('reset', this, options);
    },

    __onSync(collection, resp, options) {
        this.trigger('sync', collection, resp, options);
    },

    __onAddDelayed: _.debounce(function(options) {
        this.__rebuildIndex();
        this.trigger('reset', this, options);
    }, 10),

    __onAdd(model, collection, options) {
        if (options.at !== undefined) {
            // Updating index
            const addToIndex = function(ctx, list) {
                for (let i = 0, len = list.length; i < len; i++) {
                    if (ctx.position === ctx.targetPosition) {
                        list.add(ctx.model, { at: i });
                        return true;
                    }
                    ctx.position++;
                    const indexModel = list.at(i);
                    if (indexModel.children && addToIndex(ctx, indexModel.children)) {
                        return true;
                    }
                }
            };
            const added = addToIndex({ position: 0, targetPosition: options.at, model }, this.index);
            if (!added) {
                // border case when at === this.length
                let targetCollection = this.index;
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

    __onRemove(model, options = {}) {
        let i;
        let len;

        // collecting items in index
        function createIteratorValueChecker(iteratorValue) {
            return function(m) {
                return m.iteratorValue === iteratorValue;
            };
        }
        let index = this.index;
        const groupItems = [];
        if (this.grouping) {
            for (i = 0, len = this.grouping.length; i < len; i++) {
                const groupingOptions = this.grouping[i];
                const groupItem = index.filter(createIteratorValueChecker(groupingOptions.iterator(model)))[0];
                if (!groupItem) {
                    return;
                }
                groupItems.push(groupItem);
                index = groupItem.children;
            }
        }

        let item = index.get(model);
        if (item) {
            index.remove(item);
            this.__removeFromModels(item, options);
        }

        for (i = groupItems.length - 1; i >= 0; i--) {
            item = groupItems[i];
            index = groupItems[i - 1] || this.index;
            if (item.children.length === 0) {
                index.remove(item);
                this.__removeFromModels(item, options);
            }
        }

        this.__rebuildModels();
        this.trigger('reset', this, options);
    },

    __onUpdate(collection, updateConfiguration, options) {
        const changes = updateConfiguration.changes;

        if (changes.merged && changes.merged.length) {
            changes.merged.forEach(model => this.__onChange(model, options, true));
        }
        if (changes.removed && changes.removed.length) {
            changes.removed.forEach(model => this.__onRemove(model, options));
        }
    },

    __removeFromModels(model, options) {
        if (!this.get(model)) {
            return;
        }

        delete this._byId[model.id];
        delete this._byId[model.cid];
        const index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        this._removeReference(model, options);
    },

    __onChange(model, options, isPartialUpdate) {
        const changed = Object.keys(model.changedAttributes());
        const attrsAffectedByGrouping = [];
        this.grouping.forEach(o => {
            if (o.affectedAttributes) {
                for (let i = 0, len = o.affectedAttributes.length; i < len; i++) {
                    attrsAffectedByGrouping.push(o.affectedAttributes[i]);
                }
            }
        });

        let rebuildRequired = _.any(changed, key => attrsAffectedByGrouping.indexOf(key) !== -1);

        if (!rebuildRequired && this.comparator) {
            const previousModel = new model.constructor(model.previousAttributes(), model.options);
            if (this.comparator.length === 1) {
                const cmpVal1 = this.comparator(previousModel);
                const cmpVal2 = this.comparator(model);
                rebuildRequired = cmpVal1 !== cmpVal2;
            } else if (this.comparator.length === 2) {
                rebuildRequired = this.comparator(previousModel, model) !== 0;
            }
        }

        if (rebuildRequired || isPartialUpdate) {
            this.__rebuildIndex();
            this.trigger('reset', this, options);
        }
    },

    __onReset(collection, options) {
        this.__rebuildIndex();
        this.trigger('reset', this, options);
    },

    sort(options) {
        this.__rebuildIndex();
        this.trigger('reset', this, options);
    },

    collapse(model) {
        model.collapse(true);
        this.__rebuildModels();
        this.trigger('reset', this);
    },

    expand(model) {
        model.expand(true);
        this.__rebuildModels();
        this.trigger('reset', this);
    }
});

// methods that alter data should proxy to the parent collection
['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch', 'update'].forEach(methodName => {
    VirtualCollection.prototype[methodName] = function() {
        return this.parentCollection[methodName].apply(this.parentCollection, Array.from(arguments));
    };
});

Object.assign(VirtualCollection.prototype, Backbone.Events);

export default VirtualCollection;
