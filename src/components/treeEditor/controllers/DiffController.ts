import { GraphModel, TConfigDiff, NodeConfig, NestingOptions } from '../types';
import DiffItem from '../classes/DiffItem';
import ConfigDiff from '../classes/ConfigDiff';

type TreeDiffControllerOptions = {
    configDiff: TConfigDiff,
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
}

const personalConfigProps = ['index', 'width', 'isHidden']; //TODO add them dynamically (i.e. something like personalConfigProps aggregator)

// findAllDescendants(predicate) {
//     if (!this.isContainer) {
//         return null;
//     }
//     const result = [];
//     this.getChildren().forEach(c => {
//         if (!predicate || predicate(c)) {
//             result.push(c);
//         }
//         const r = c.findAllDescendants(predicate);
//         if (r && r.length > 0) {
//             result.push(...r);
//         }
//     });
//     return result;
// },

const findAllDescendants = (model: GraphModel, predicate?: (graphModel: GraphModel) => boolean) => {
    if (!model.isContainer) {
        return [];
    }

    const result: GraphModel[] = [];
    const children = typeof model.getChildren === 'function' ? model.getChildren() : model.get(model.childrenAttribute);

    children.forEach((c: GraphModel) => {
        if (!predicate || predicate(c)) {
            result.push(c);
        }

        const r = findAllDescendants(c);

        if (r && r.length > 0) {
            result.push(...r);
        }
    });

    return result;
};

export default class TreeDiffController {
    configDiff: TConfigDiff;
    configuredCollectionsSet: Set<Backbone.Collection>;
    graphDescendants: Map<string, GraphModel>;

    constructor(options: TreeDiffControllerOptions) {
        const { configDiff, graphModel, reqres, nestingOptions } = options;

        this.configuredCollectionsSet = new Set();

        this.__initDescendants(graphModel, nestingOptions);
        this.__initConfiguration(configDiff);

        reqres.reply('treeEditor:setWidgetConfig', (widgetId: string, config: NodeConfig) => this.__setNodeConfig(widgetId, config));
    }

    reset() {
        this.configDiff.clear();
        this.__applyDiff();
    }

    set(configDiff: TConfigDiff) {
        configDiff.forEach((value, key) => this.configDiff.set(key, value));
        this.__applyDiff();
    }

    __setNodeConfig(widgetId: string, keyValue: NodeConfig) {
        this.configDiff.set(widgetId, keyValue);
    }

    __initConfiguration(configDiff: TConfigDiff) {
        this.set(configDiff);
    }

    __getNestingFilter(nestingOptions: NestingOptions) {
        const { stopNestingType, forceBranchType, forceLeafType } = nestingOptions;
        const filterFn = (model: GraphModel) => true;

        return filterFn
    }

    __initDescendants(graphModel: GraphModel, nestingOptions: NestingOptions) {
        
        const filterFn = this.__getNestingFilter(nestingOptions);
        const descendants = typeof graphModel.findAllDescendants === 'function' ? graphModel.findAllDescendants(filterFn) : findAllDescendants(graphModel, filterFn);
        // const descendants = this.__applyNestingFilter(graphDescendantsArray, nestingOptions)

        this.graphDescendants = new Map(descendants.map((model: GraphModel) => [model.id, model]));

        const collectionsSet = new Set();

        descendants.forEach((model: GraphModel) => {
            if (model.collection) {
                collectionsSet.add(model.collection);
            }
        });
        collectionsSet.forEach((coll: CollectionWithInitIalConfig) => (coll.initialConfig = coll.map(m => m.id)));

        const reducer = (initialConfig: Map<string, DiffItem>, model: GraphModel) => {
            const pick = _.defaults(model.pick(...personalConfigProps), { index: model.collection?.indexOf(model) }); // TODO maybe the rest of defaults should be moved to here too

            initialConfig.set(model.id, new DiffItem(pick));

            return initialConfig;
        };

        const initialConfig = descendants.reduce(reducer, new Map());

        this.configDiff = new ConfigDiff(initialConfig);

        const nonUniqueList = findDuplicates(descendants.map((model: GraphModel)  => model.id));
        if (nonUniqueList.length) {
            Core.InterfaceError.logError(`Error: graph models has non-unique ids: ${nonUniqueList}. Unpredictable behavior is possible.`);
        }
    }

    // apply diff to graphModel
    __applyDiff() {
        this.graphDescendants.forEach((model, modelId) => {
            const configMap = this.configDiff.get(modelId) || this.configDiff.initialConfig.get(modelId);
            const configObject = configMap.toObject();

            if (configMap.size) {
                model.set(configObject);
            }

            personalConfigProps.filter(prop => configObject[prop] == null).map(prop => model.unset(prop));

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
