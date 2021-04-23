import { GraphModel, NodeConfig, NestingOptions } from '../types';
import DiffItem from '../classes/DiffItem';
import ConfigDiff from '../classes/ConfigDiff';
import Backbone from 'backbone';
import _ from 'underscore';

type TreeDiffControllerOptions = {
    configDiff: ConfigDiff,
    graphModel: GraphModel,
    initialModel: GraphModel,
    calculateDiff: boolean,
    reqres: Backbone.Radio.Channel,
    nestingOptions?: NestingOptions
};

interface CollectionWithInitIalConfig extends Backbone.Collection {
    initialConfig: string[];
}

// TODO: option
const observableProperties = ['index', 'isHidden', 'width', 'sorting', 'filter', 'isLazyLoading', 'viewType'];

const findDuplicates = (array: string[]): string[] => {
    const count = (arr: string[]) => arr.reduce<Record<string, number>>((acc, name) => ({ ...acc, [name]: (acc[name] || 0) + 1 }), {});
    const duplicates = (dict: Record<string, number>) => Object.keys(dict).filter((a: string) => dict[a] > 1);

    return duplicates(count(array));
};

const findAllDescendants = (model: GraphModel, predicate?: (model: GraphModel) => boolean) => {
    if (!model.isContainer || !model.childrenAttribute) {
        return [];
    }

    const result: GraphModel[] = [];
    const children: Backbone.Collection<GraphModel> = typeof model.getChildren === 'function' ? model.getChildren() : model.get(model.childrenAttribute);

    children.forEach(c => {
        if (!predicate || predicate(c)) {
            result.push(c);
        }

        const r = findAllDescendants(c, predicate);

        if (r && r.length > 0) {
            result.push(...r);
        }
    });

    return result;
};

const filterDescendants = (model: GraphModel, filterFn: (graphModel: GraphModel) => boolean) => {
    if (!model.isContainer) {
        return [];
    }

    const result: GraphModel[] = [];
    let children;
    if (typeof model.getChildren === 'function') {
        children = model.getChildren();
    }
    if (model.childrenAttribute) {
        children = model.get(model.childrenAttribute);
    }
    if (!children) {
        return [];
    }

    children.forEach((c: GraphModel) => {
        result.push(c);

        if (!filterFn(c)) {
            return;
        }

        const r = filterDescendants(c, filterFn);

        if (r && r.length > 0) {
            result.push(...r);
        }
    });

    return result;
};

export default class TreeDiffController {
    configDiff: ConfigDiff;
    configuredCollectionsSet: Set<Backbone.Collection>;
    filteredDescendants: Map<string, GraphModel>;
    descendants: Map<string, GraphModel>;
    reqres: Backbone.Radio.Channel;

    constructor(options: TreeDiffControllerOptions) {
        const { configDiff, graphModel, reqres, nestingOptions, calculateDiff, initialModel } = options;

        this.reqres = reqres;
        this.configuredCollectionsSet = new Set();

        this.__initDescendants(graphModel, nestingOptions, calculateDiff, initialModel);
        this.__initConfiguration(configDiff, calculateDiff);

        reqres.reply('treeEditor:setWidgetConfig', (widgetId: string, config: NodeConfig) => this.__setNodeConfig(widgetId, config));
    }

    reset() {
        this.configDiff.clear();
        this.applyDataToModel({ fromInitialConfig: true });
    }

    set(configDiff: ConfigDiff) {
        this.__passConfigDiff(configDiff);
        this.applyDataToModel({});
    }

    __setNodeConfig(widgetId: string, keyValue: NodeConfig) {
        this.configDiff.set(widgetId, keyValue);
    }

    __initConfiguration(configDiff: ConfigDiff, calculateDiff: boolean) {
        if (calculateDiff) {
            this.applyModelToDiff();
        } else {
            this.__passConfigDiff(configDiff);
            this.applyDataToModel();
        }
    }

    __passConfigDiff(configDiff: ConfigDiff) {
        if (configDiff.initialConfig) {
            configDiff.initialConfig.forEach((value, key) => this.configDiff.set(key, configDiff.get(key) || value));
        } else {
            configDiff.forEach((value, key) => this.configDiff.set(key, value));
        }
    }

    __initDescendants(graphModel: GraphModel, nestingOptions: NestingOptions = {}, calculateDiff: boolean, initialModel: GraphModel) {
        const { hasControllerType } = nestingOptions;
        const filterFn = (model: GraphModel) => {
            const type = model.get('type');
            const fieldType = model.get('fieldType');

            if (!hasControllerType) {
                return true;
            }

            const result = Array.isArray(hasControllerType)
                ? hasControllerType.includes(type) || hasControllerType.includes(fieldType)
                : type === hasControllerType || fieldType === hasControllerType;

            return !result;
        };

        const filteredDestsArray = filterDescendants(graphModel, filterFn);
        this.filteredDescendants = new Map(filteredDestsArray.map((model: GraphModel) => [model.id, model]));

        const findAllDescendantsFunc = graphModel.findAllDescendants;
        const descendantsArr = typeof findAllDescendantsFunc === 'function' ? findAllDescendantsFunc.call(graphModel) : findAllDescendants(graphModel);
        descendantsArr.unshift(graphModel);

        const descendants = (this.descendants = new Map(descendantsArr.map((model: GraphModel) => [model.id, model])));

        const collectionsSet = new Set();
        let initialDescendants = new Map();
        if (calculateDiff) {
            const initialDescendantsArr = typeof findAllDescendantsFunc === 'function' ? findAllDescendantsFunc.call(initialModel) : findAllDescendants(initialModel);
            initialDescendantsArr.push(initialModel);
            initialDescendants = new Map(initialDescendantsArr.map((model: GraphModel) => [model.id, model]));
        }

        descendants.forEach((model: GraphModel) => {
            if (model.collection) {
                collectionsSet.add(model.collection);
            }
        });

        collectionsSet.forEach((coll: CollectionWithInitIalConfig) => {
            if (!coll.initialConfig) {
                Object.defineProperty(coll, 'initialConfig', {
                    writable: false,
                    value: coll.map(m => m.id)
                });
            }
        });

        const reducer = (initialConfig: Map<string, DiffItem>, model: GraphModel, index: number) => {
            if (!model.initialConfig) {
                const modelToPick = calculateDiff ? initialDescendants.get(model.id) || model : model;
                const pick = {
                    ...modelToPick.pick(observableProperties),
                    index: modelToPick.collection?.indexOf(modelToPick),
                };
                Object.defineProperty(model, 'initialConfig', {
                    writable: false,
                    value: pick
                });
            }

            initialConfig.set(model.id, new DiffItem(model.initialConfig));

            return initialConfig;
        };

        const initialConfig = descendantsArr.reduce(reducer, new Map());

        this.configDiff = new ConfigDiff(initialConfig);

        const nonUniqueList = findDuplicates(descendantsArr.map((model: GraphModel) => model.id));
        if (nonUniqueList.length) {
            Core.InterfaceError.logError(`Error: graph models has non-unique ids: ${nonUniqueList}. Unpredictable behavior is possible.`);
        }
    }

    /**
     * Apply current state of graph models to diff
     * @param properties - property names to pick
     */
    applyModelToDiff(properties: string[] = ['width, index', 'isHidden']) {
        this.descendants.forEach((model, modelId) => {
            const diffObject: Record<string, any> = {};
            properties.forEach(property => {
                let propertyValue;
                switch (property) {
                    case 'index':
                        if (model.collection) {
                            propertyValue = model.collection.indexOf(model);
                        }
                        break;
                    default:
                        propertyValue = model.get(property);
                        break;
                }
                diffObject[property] = propertyValue;
            });
            this.__setNodeConfig(modelId, diffObject);
        });
    }

    applyInitialConfigToModel(properties: string[]) {
        this.applyDataToModel({ properties, fromInitialConfig: true });
    }

    applyDiffToModel(properties: string[]) {
        this.applyDataToModel({ properties });
    }

    // apply data to graphModel
    applyDataToModel({ fromInitialConfig = false, properties = ['index', 'width', 'isHidden'], descendants = this.descendants }
                         : { fromInitialConfig?: boolean, properties?: string[], descendants?: Map<string, GraphModel> } = {}) {
        descendants.forEach((model, modelId) => {
            const configMap = this.configDiff.get(modelId) || this.configDiff.initialConfig.get(modelId);
            const configObject = configMap.toObject();

            if (configMap.size && !fromInitialConfig) {
                model.set({ ...configMap.initialConfig, ...configObject });
            } else {
                model.set(_.pick(configMap.initialConfig, properties));
            }
            const collection = model.collection;
            if (collection) {
                const indexObject = fromInitialConfig ? configMap.initialConfig : configObject;
                const configIndex = indexObject.index == null ? collection.initialConfig.indexOf(model.id) : indexObject.index;
                if (configIndex !== collection.indexOf(model)) {
                    this.configuredCollectionsSet.add(collection);
                }
            }
        });

        this.configuredCollectionsSet.forEach((coll: CollectionWithInitIalConfig) => {
            this.__reorderCollectionByIndex(coll, fromInitialConfig);
            if (coll.initialConfig.every((id, i) => coll.at(i).id === id)) {
                // that means the collection has returned to its initial state
                this.configuredCollectionsSet.delete(coll);
            }
        });

        this.reqres.trigger('treeEditor:diffApplied');
    }

    __reorderCollectionByIndex(collection: CollectionWithInitIalConfig, fromInitialConfig: boolean) {
        const getModelsIndex = (id: string) => {
            const configMap = this.configDiff.get(id) || this.configDiff.initialConfig.get(id);
            const configIndex = fromInitialConfig ? configMap.initialConfig.index : configMap.get('index');
            return configIndex != null ? configIndex : collection.initialConfig.indexOf(id);
        };

        const collectionConfig = collection.map((model: GraphModel) => model.id).sort((a: string, b: string) => getModelsIndex(a) - getModelsIndex(b));
        const collIndexes = collection.map(model => model.id);

        const groupsToReorder = this.__groupDeviantItems(collectionConfig, collIndexes);
        const getConfigIndex = (model: GraphModel) => collectionConfig.indexOf(model.id);

        groupsToReorder.map((group: string[]) => {
            const modelsGroup = [...collection.filter((model: GraphModel) => group.includes(model.id))];
            const insertIndex = collection.indexOf(modelsGroup[0]);

            modelsGroup.sort((a: GraphModel, b: GraphModel) => getConfigIndex(a) - getConfigIndex(b));

            collection.remove(modelsGroup);
            collection.add(modelsGroup, { at: insertIndex });
        });

        collection.trigger('columns:move', collectionConfig);
    }

    __groupDeviantItems(deviantArray: Array<string | number | boolean>, templateArray: Array<string | number | boolean>) {
        const groups = deviantArray.reduce(
            (groupsAccumulator: [string[]], currentId: string, i: number) => {
                if (currentId !== templateArray[i]) {
                    groupsAccumulator[groupsAccumulator.length - 1].push(currentId);
                } else {
                    if (groupsAccumulator[groupsAccumulator.length - 1].length) {
                        groupsAccumulator.push([]);
                    }
                }
                return groupsAccumulator;
            },
            [[]]
        );

        return groups.filter((group: string[]) => group.length);
    }
}
