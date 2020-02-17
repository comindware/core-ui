import { GraphModel, NodeConfig, NestingOptions } from '../types';
import DiffItem from '../classes/DiffItem';
import ConfigDiff from '../classes/ConfigDiff';

type TreeDiffControllerOptions = {
    configDiff: ConfigDiff,
    graphModel: GraphModel,
    reqres: Backbone.Radio.Channel,
    nestingOptions: NestingOptions
};

interface CollectionWithInitIalConfig extends Backbone.Collection {
    initialConfig: string[];
}

const findDuplicates = (array: string[]): string[] => {
    const count = (arr: string[]) => arr.reduce((acc: { [name: string] }, name) => ({ ...acc, [name]: (acc[name] || 0) + 1}), {});
    const duplicates  = (dict: { [name: string] }) => Object.keys(dict).filter((a: string) => dict[a] > 1);

    return duplicates(count(array));
};

const findAllDescendants = (model: GraphModel, predicate?: (model: GraphModel) => boolean) => {
    if (!model.isContainer) {
        return [];
    }

    const result: GraphModel[] = [];
    const children = typeof model.getChildren === 'function' ? model.getChildren() : model.get(model.childrenAttribute);

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
    const children = typeof model.getChildren === 'function' ? model.getChildren() : model.get(model.childrenAttribute);

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
    reqres: Backbone.Radio.Channel

    constructor(options: TreeDiffControllerOptions) {
        const { configDiff, graphModel, reqres, nestingOptions } = options;

        this.reqres= reqres;
        this.configuredCollectionsSet = new Set();

        this.__initDescendants(graphModel, nestingOptions);
        this.__initConfiguration(configDiff);

        reqres.reply('treeEditor:setWidgetConfig', (widgetId: string, config: NodeConfig) => this.__setNodeConfig(widgetId, config));
    }

    reset() {
        this.configDiff.clear();
        this.__applyDiff();
    }

    set(configDiff: ConfigDiff) {
        this.__passConfigDiff(configDiff);
        this.__applyDiff();
    }

    setVisibleConfigDiffInit() {
        this.configDiff.initialConfig.forEach( item => item.initialConfig.isHidden = false);
    }

    __setNodeConfig(widgetId: string, keyValue: NodeConfig) {
        this.configDiff.set(widgetId, keyValue);
    }

    __initConfiguration(configDiff: ConfigDiff) {
        this.__passConfigDiff(configDiff);
        this.__applyDiff(this.filteredDescendants);

    }

    __passConfigDiff(configDiff: ConfigDiff) {
        if (configDiff.initialConfig) {
            configDiff.initialConfig.forEach((value, key) => this.configDiff.set(key, configDiff.get(key) || value));
        } else {
            configDiff.forEach((value, key) => this.configDiff.set(key, value));
        }

    }

    __initDescendants(graphModel: GraphModel, nestingOptions: NestingOptions) {
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
        const descendants = this.descendants = new Map(descendantsArr.map((model: GraphModel) => [model.id, model]));
        const collectionsSet = new Set();

        descendants.forEach((model: GraphModel) => {
            if (model.collection) {
                collectionsSet.add(model.collection);
            }
        });

        collectionsSet.forEach((coll: CollectionWithInitIalConfig) => {
            if(!coll.initialConfig) {
                Object.defineProperty(coll, 'initialConfig' , {
                    writable: false,
                    value: coll.map(m => m.id)
                })
            }
        });

        const reducer = (initialConfig: Map<string, DiffItem>, model: GraphModel) => {
            if (!model.initialConfig) {
                const pick = {
                    index: model.collection?.indexOf(model),
                    isHidden: false,
                    width: model.get('width') || 0
                };
                Object.defineProperty(model, 'initialConfig' , {
                    writable: false,
                    value: pick
                })
            }

            initialConfig.set(model.id, new DiffItem(model.initialConfig));

            return initialConfig;
        };

        const initialConfig = descendantsArr.reduce(reducer, new Map());

        this.configDiff = new ConfigDiff(initialConfig);

        const nonUniqueList = findDuplicates(descendantsArr.map((model: GraphModel)  => model.id));
        if (nonUniqueList.length) {
            Core.InterfaceError.logError(`Error: graph models has non-unique ids: ${nonUniqueList}. Unpredictable behavior is possible.`);
        }
    }

    setInitConfig(initConfig: ConfigDiff) {
        const keys = Array.from(initConfig.keys());
        const collection = this.descendants.values().next().value?.collection;
        if (collection) {
            const currentState = collection.initialConfig;
            keys.forEach(key => {
                const currentIndexColumn = currentState.indexOf(key);
                const newIndexColumn = keys.indexOf(key);
                if (currentState.includes(key) && keys.includes(key) && (currentIndexColumn !== newIndexColumn)) {
                    const column = collection.get(key);
                    collection.remove(column);
                    collection.add(column, { at: newIndexColumn });
                }
            })
        }
    }

    // apply diff to graphModel
    __applyDiff(descendants = this.descendants) {
        descendants.forEach((model, modelId) => {
            const configMap = this.configDiff.get(modelId) || this.configDiff.initialConfig.get(modelId);
            const configObject = configMap.toObject();

            if (configMap.size) {
                model.set(configObject);
            } else {
                model.set(configMap.initialConfig);
            }
            const collection = model.collection;
            if (collection) {
                const configIndex = configObject.index == null ? collection.initialConfig.indexOf(model.id) : configObject.index;
                if (configIndex !== collection.indexOf(model)) {
                    this.configuredCollectionsSet.add(collection);
                }
            }
        });

        this.configuredCollectionsSet.forEach((coll: CollectionWithInitIalConfig) => {
            this.__reorderCollectionByIndex(coll);
            if (coll.initialConfig.every((id, i) => coll.at(i).id === id)) {
                // that means the collection has returned to its initial state
                this.configuredCollectionsSet.delete(coll);
            }
        });

        this.reqres.trigger('treeEditor:diffApplied');
    }

    __reorderCollectionByIndex(collection: CollectionWithInitIalConfig) {
        const getModelsIndex = (id: string) => {
            const configIndex = this.configDiff.get(id)?.get('index');
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
