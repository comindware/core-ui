import { GraphModel, TConfigDiff } from '../types';

type TreeDiffControllerOptions = {
    configDiff: TConfigDiff,
    graphModel: GraphModel,
    reqres: Backbone.Radio.Channel
};

interface CollectionWithInitIalConfig extends Backbone.Collection {
    initialConfig: string[];
}

const personalConfigProps = ['index', 'width', 'isHidden']; //TODO add them dynamically (personalConfigProps aggregator)

const findAllDescendants = (model: GraphModel) => {
    if (!model.isContainer) {
        return [];
    }

    const result: GraphModel[] = [];
    const children = typeof model.getChildren === 'function' ? model.getChildren() : model.get(model.childrenAttribute);

    children.forEach((c: GraphModel) => {
        result.push(c);
        const r = findAllDescendants(c);
        if (r && r.length > 0) {
            result.push(...r);
        }
    });

    return result;
};

export default class TreeDiffController {
    configDiff: any;
    configuredCollectionsSet: Set<Backbone.Collection>;
    graphDescendants: object;

    constructor(options: TreeDiffControllerOptions) {
        const { configDiff, graphModel, reqres } = options;

        this.configuredCollectionsSet = new Set();

        this.__initDescendants(graphModel);
        this.__initConfiguration(configDiff);

        reqres.reply('treeEditor:setWidgetConfig', (widgetId: string, config: {}) => this.__setWidgetConfig(widgetId, config));
    }

    reset() {
        this.configDiff = {};
        this.__applyDiff();
    }

    set(configDiff: TConfigDiff) {
        this.configDiff = configDiff;
        this.__applyDiff();
    }

    __initConfiguration(configDiff: TConfigDiff) {
        this.set(configDiff);
    }

    __initDescendants(graphModel: GraphModel) {
        const collectionsSet = new Set();

        const graphDescendantsArray = typeof graphModel.findAllDescendants === 'function' ? graphModel.findAllDescendants() : findAllDescendants(graphModel);
        this.graphDescendants = graphDescendantsArray.reduce((allDesc: GraphModel[], model: GraphModel) => ((allDesc[model.id] = model), allDesc), {});

        const containsNonUniqueIds = (() => {
            const keys = graphDescendantsArray.map(model => model.id);
            const set = new Set(keys);
            return keys.length !== set.size;
        })();

        if (containsNonUniqueIds) {
            Core.InterfaceError.logError('Error: graph models have non-unique ids. You must to reboot your computer immediately!!!');
        }

        Object.values(this.graphDescendants).forEach(model => {
            const initialConfig = {};

            personalConfigProps.forEach(prop => {
                const propValue = model.get(prop);
                if (propValue != null) {
                    if (prop !== 'index' && !propValue) {
                        return;
                    }

                    initialConfig[prop] = propValue;

                    return;
                }
            });

            model.initialConfig = initialConfig;

            if (model.collection) {
                collectionsSet.add(model.collection);
            }
        });

        collectionsSet.forEach((coll: CollectionWithInitIalConfig) => (coll.initialConfig = coll.map(m => m.id)));
    }

    // set given widget's diff config to configDiff array
    __setWidgetConfig(widgetId, keyValue) {
        const [key, value] = Object.entries(keyValue)[0];
        const initialValue = this.graphDescendants[widgetId].initialConfig[key];
        const isDefault = (() => {
            if (key === 'index') {
                const model = this.graphDescendants[widgetId];

                return value === model.collection.initialConfig.indexOf(model.id);
            }
            return !value || value === initialValue; // here "!value" means: isHidden===false or width===0
        })();

        if (this.configDiff[widgetId]) {
            if (isDefault) {
                // unset property if it is equal to default (for perfomance purpose)
                delete this.configDiff[widgetId][key];
                if (!Object.keys(this.configDiff[widgetId]).length) {
                    delete this.configDiff[widgetId];
                }

                return;
            }

            Object.assign(this.configDiff[widgetId], keyValue);

            return;
        }

        if (!isDefault) {
            this.configDiff[widgetId] = keyValue;
        }
    }

    // apply diff to graphModel
    __applyDiff() {
        Object.entries(this.graphDescendants).forEach(([modelId, model]) => {
            //if we come to the situation where we had returned to initial state, we don't want to apply any changes
            if (this.configDiff[modelId] && _.isEqual(this.configDiff[modelId], model.initialConfig)) {
                delete this.configDiff[modelId];
            }

            const config = this.configDiff[modelId] || model.initialConfig;

            if (Object.keys(config).length) {
                model.set(config);
            }

            personalConfigProps.filter(prop => config[prop] == null).map(prop => model.unset(prop));

            const collection = model.collection;
            if (collection) {
                const configIndex = config.index == null ? collection.initialConfig.indexOf(model.id) : config.index;
                if (configIndex !== collection.indexOf(model)) {
                    this.configuredCollectionsSet.add(collection);
                }
            }
        });

        this.configuredCollectionsSet.forEach((coll: CollectionWithInitIalConfig) => {
            this.__reorderCollectionByIndex(coll);
            if (coll.initialConfig.every((id, i) => coll.at(i).id === id)) {
                // that means collection returned to the inital state
                this.configuredCollectionsSet.delete(coll);
            }
        });
    }

    __reorderCollectionByIndex(collection: CollectionWithInitIalConfig) {
        const collIndexes = collection.map(model => model.id);
        const getModelsIndex = (id: string) => (this.configDiff[id]?.index != null ? this.configDiff[id].index : collection.initialConfig.indexOf(id));
        const collectionConfig = collection.map((model: GraphModel) => model.id).sort((a: string, b: string) => getModelsIndex(a) - getModelsIndex(b));
        const groupsToReorder = collectionConfig
            // beautiful, clean and self-explanatory code don't need to be commented
            .reduce(
                (groupsAccumulator: [string[]], currentId: string, i: number) => {
                    if (currentId != collIndexes[i]) {
                        groupsAccumulator[groupsAccumulator.length - 1].push(currentId);
                    } else {
                        if (groupsAccumulator[groupsAccumulator.length - 1].length) {
                            groupsAccumulator.push([]);
                        }
                    }
                    return groupsAccumulator;
                },
                [[]]
            )
            .filter((group: string[]) => group.length);

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
}
