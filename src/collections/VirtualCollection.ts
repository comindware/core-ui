import Backbone from 'backbone';
import _ from 'underscore';
import SelectableBehavior from '../models/behaviors/SelectableBehavior';
import CheckableBehavior from '../models/behaviors/CheckableBehavior';
import { diffHelper } from 'utils';
import GridItemBehavior from '../list/behaviors/GridItemBehavior';
import FixGroupingOptions from './GroupingService';
import { virtualCollectionFilterActions } from 'Meta';

const selectableBehavior = {
    none: null,
    single: SelectableBehavior.SingleSelect,
    multi: SelectableBehavior.MultiSelect
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

const VirtualCollection = Backbone.Collection.extend({
    constructor(collection, options = {}) {
        this.options = options;
        this.isTree = this.options.isTree;
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
            this.filterFn = typeof options.filter === 'function' ? [options.filter] : options.filter || [];
        }

        this._reset();

        this.state = {
            position: options.position || 0,
            windowSize: options.windowSize || 1
        };
        this.visibleModels = [];

        this.isSliding = options.isSliding;

        this.__debounceRebuild = _.debounce((...args) => this.__rebuildModels(...args), 10);

        if (options.model) {
            this.model = options.model;
        } else if (collection.model) {
            this.model = collection.model;
        }

        this.__rebuildIndex({}, true);

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
            _.extend(this, new SelectableBehaviorClass(this));
        }
        _.extend(this, new CheckableBehavior.CheckableCollection(this));
    },

    rebuild() {
        this.__rebuildIndex({}, true);
    },

    highlight(text) {
        this.parentCollection.each(record => {
            if (record.highlight) {
                record.highlight(text);
            }
        });
    },

    unhighlight() {
        this.parentCollection.each(record => {
            if (record.unhighlight) {
                record.unhighlight();
            }
        });
    },

    updateWindowSize(newWindowSize) {
        if (this.state.windowSize !== newWindowSize) {
            this.internalUpdate = true;
            this.isSliding = true;
            this.state.windowSize = newWindowSize;
            const oldModels = this.visibleModels.concat();
            this.visibleModels = this.models.slice(this.state.position, this.state.position + this.state.windowSize);
            this.visibleLength = this.visibleModels.length;
            this.__processDiffs(oldModels);
            this.internalUpdate = false;
        }
    },

    __rebuildIndex(options = {}, immediate) {
        let parentModels = this.parentCollection.models;
        if (this.filterFn) {
            parentModels = this.__filterModels(this.parentCollection.models);
        }

        this.index = this.__createIndexTree(parentModels, 0);
        if (immediate) {
            this.__rebuildModels(options);
        } else {
            this.__debounceRebuild(options);
        }
    },

    __rebuildModels(options) {
        const oldModels = this.visibleModels.concat();
        this._reset();
        this.visibleModels = [];
        this.visibleLength = 0;
        this.__buildModelsInternal(this.index);
        if (!this.models.length) {
            this.trigger('reset', this);
            return;
        }

        if (this.isSliding) {
            this.visibleModels = this.models.slice(this.state.position, this.state.position + this.state.windowSize);
        } else {
            this.visibleModels = this.models;
        }
        this.visibleLength = this.visibleModels.length;
        this.__processDiffs(oldModels, options);
    },

    __addModel(model, options) {
        const index = this.visibleModels.indexOf(model);
        this.trigger('add', model, this, Object.assign({}, options, { at: index, index })); // both add and index to correct inserting in dom
    },

    __removeModels(removed, options) {
        this.trigger(
            'update',
            this,
            Object.assign({}, options, {
                changes: {
                    removed,
                    added: options.added || [],
                    merged: []
                }
            })
        );
    },

    __buildModelsInternal(list, level = 0) {
        // Run sort based on type of `comparator`.
        if (this.comparator) {
            if (typeof this.comparator === 'string' || this.comparator.length === 1) {
                list.models = _.sortBy(list.models, this.comparator, this);
            } else {
                list.models.sort(_.bind(this.comparator, this));
            }
        }
        list.forEach(model => {
            this.length++;
            this.models.push(model);
            this._addReference(model);

            model.collection = this;
            model.level = level;

            Object.assign(model, GridItemBehavior(this));

            if (!model.collapsed && model.children) {
                //Skip building children models, if parent model is collapsed
                if (this.isTree) {
                    this.stopListening(model.children, 'add remove reset');
                    this.listenToOnce(model.children, 'add remove reset', this.__debounceRebuild);
                }
                if (this.isTree && this.filterFn && model.filteredChildren) {
                    this.__buildModelsInternal(new Backbone.Collection(model.filteredChildren), level + 1);
                } else {
                    this.__buildModelsInternal(model.children, level + 1);
                }
            }
        });
    },

    __createIndexTree(models, i) {
        const self = this;
        if (i < this.grouping.length) {
            const groupingOptions = this.grouping[i];
            FixGroupingOptions(groupingOptions);

            return new Backbone.Collection(
                _.chain(models)
                    .groupBy(groupingOptions.iterator)
                    .map(v => {
                        const node = groupingOptions.modelFactory(v[0], v);
                        node.iteratorValue = groupingOptions.iterator(v[0]);
                        node.comparatorValue = groupingOptions.comparator(v[0], v);
                        node.children = self.__createIndexTree(v, i + 1);
                        return node;
                    })
                    .sortBy(n => n.comparatorValue)
                    .value()
            );
        }
        return new Backbone.Collection(models);
    },

    /**
     * Обновить позицию скользящего окна
     * @param {Number} newPosition Новая позиция скользящего окна
     * */
    updatePosition(newPosition) {
        newPosition = this.__normalizePosition(newPosition);
        if (newPosition === this.state.position) {
            return newPosition;
        }
        this.internalUpdate = true;

        this.state.position = newPosition;
        const oldModels = this.visibleModels.concat();
        this.visibleModels = this.models.slice(this.state.position, this.state.position + this.state.windowSize);
        this.visibleLength = this.visibleModels.length;
        this.__processDiffs(oldModels);

        this.internalUpdate = false;

        return newPosition;
    },

    __processDiffs(oldModels, options = {}) {
        const diff = new diffHelper(oldModels, this.visibleModels);
        const diffObject = diff.compose();

        diffObject.common.forEach(e => this.trigger('update:child', e)); //update child index and collapses

        const sorted = diffObject.add.sort((a, b) => this.visibleModels.indexOf(a) - this.visibleModels.indexOf(b));
        options.added = sorted;

        // it's important remove items before add
        this.__removeModels(diffObject.remove, options);
        sorted.forEach(model => this.__addModel(model, options));
    },

    __normalizePosition(position) {
        const maxPos = Math.max(0, this.length - this.state.windowSize);
        return Math.max(0, Math.min(maxPos, position));
    },

    filter(filterFn, { action } = {}) {
        if (!this.filterFn) {
            this.filterFn = [];
        }
        switch (action) {
            case virtualCollectionFilterActions.PUSH: //adds to the array filter function (or an array of them) with the specified name
                if (Array.isArray(filterFn)) {
                    this.filterFn.concat(filterFn);
                } else {
                    this.filterFn.push(filterFn);
                }
                this.filterFn = [...new Set(this.filterFn)];
                break;
            case virtualCollectionFilterActions.REMOVE: //removes from the array the filter function with the specified name
                const index = this.filterFn.findIndex(fn => fn === filterFn);
                if (index > -1) {
                    this.filterFn.splice(index, 1);
                }
                break;
            default:
                //'reset' - classic behavior. Replaces all filterFns with new one.
                this.filterFn = filterFn ? (Array.isArray(filterFn) ? filterFn : [filterFn]) : [];
                break;
        }

        this.__rebuildIndex({}, true);
        this.trigger('filter');
    },

    __filterModels(models) {
        const result = [];
        models.forEach(model => {
            if (model.children && model.children.length) {
                model.filteredChildren = this.__filterModels(model.children.models);
            }

            if (this.filterFn.every(fn => fn.call(models, model, fn.parameters)) || (model.filteredChildren && model.filteredChildren.length)) {
                result.push(model);
            }
        });

        return result;
    },

    group(grouping) {
        if (grouping !== undefined) {
            this.grouping = grouping;
        }

        this.__rebuildIndex();
    },

    grouping: [],

    __onSort(collection, options) {
        if (this.comparator !== undefined) {
            return;
        }

        this.__rebuildIndex(options);
    },

    __onSync(collection, resp, options) {
        this.trigger('sync', collection, resp, options);
    },

    __onAdd(model, collection, options) {
        // TODO: maybe this is unnecessary
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
            return;
        }

        this.__rebuildIndex();
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
            // this.__removeFromModels(item, options);
            this._removeReference(model);
        }

        for (i = groupItems.length - 1; i >= 0; i--) {
            item = groupItems[i];
            index = groupItems[i - 1] || this.index;
            if (item.children.length === 0) {
                index.remove(item);
                // this.__removeFromModels(item, options);
                this._removeReference(model);
            }
        }

        this.__rebuildIndex(options);
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
        if (this.options.skipRebuildOnChange) {
            return;
        }
        const changed = Object.keys(model.changedAttributes());
        const attrsAffectedByGrouping = [];
        this.grouping.forEach(o => {
            if (o.affectedAttributes) {
                for (let i = 0, len = o.affectedAttributes.length; i < len; i++) {
                    attrsAffectedByGrouping.push(o.affectedAttributes[i]);
                }
            }
        });

        let rebuildRequired = changed.some(key => attrsAffectedByGrouping.indexOf(key) !== -1);

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
            this.__rebuildIndex(options);
        }
    },

    __onReset(collection, options) {
        this.__rebuildIndex(options, true);
    },

    sort(options) {
        this.__rebuildIndex(options, true);
    },

    collapse(model) {
        model.collapse();
        this.__rebuildIndex();
        this.parentCollection.trigger('collapse', model);
    },

    expand(model) {
        model.expand();
        this.__rebuildIndex();
        this.parentCollection.trigger('expand', model);
    },

    getState() {
        return this.state;
    }
});

// methods that alter data should proxy to the parent collection
['add', 'remove', 'set', 'reset', 'push', 'pop', 'unshift', 'shift', 'slice', 'sync', 'fetch', 'update', 'where', 'findWhere'].forEach(methodName => {
    VirtualCollection.prototype[methodName] = function() {
        return this.parentCollection[methodName].apply(this.parentCollection, Array.from(arguments));
    };
});

export default VirtualCollection;
