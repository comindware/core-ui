const personalConfigProps = ['index', 'width', 'isHidden']; //TODO add them dynamically (personalConfigProps aggregator)

const findAllDescendants = model => {
    if (!model.isContainer) {
        return null;
    }
    const result = [];
    const children = model.getChildren && typeof model.getChildren === 'function' ? model.getChildren() : model.get(model.childrenAttribute);
    children.forEach(c => {
        result.push(c);
        const r = findAllDescendants(c);
        if (r && r.length > 0) {
            result.push(...r);
        }
    });
    return result;
};

const objectsDeepComparison = (objOne, objTwo) => {
    const props = [...new Set([...Object.keys(objOne), ...Object.keys(objTwo)])];

    return props.every(prop => {
        if (objOne[prop] instanceof Object && objTwo[prop] instanceof Object) {
            return objectsDeepComparison(objOne[prop], objTwo[prop]);
        }
        return objOne[prop] === objTwo[prop];
    });
};

export default class TreeDiffController {
    constructor(options) {
        const { configDiff, graphModel, reqres } = options;

        this.configuredCollectionsSet = new Set();

        this.__initDescendants({ graphModel, reqres });
        this.__initConfiguration(configDiff);

        reqres.reply('treeEditor:setWidgetConfig', (widgetId: string, config: {}) => this.__setWidgetConfig(widgetId, config));
    }

    reset() {
        this.configDiff = {};
        this.__applyDiff();
    }

    set(configDiff) {
        this.configDiff = configDiff;
        this.__applyDiff();
    }

    __initConfiguration(configDiff) {
        this.set(configDiff);
    }

    __initDescendants(options) {
        const { graphModel } = options;
        const collectionsSet = new Set();

        const graphDescendantsArray =
            graphModel.findAllDescendants && typeof graphModel.findAllDescendants === 'function' ? graphModel.findAllDescendants() : findAllDescendants(graphModel);
        this.graphDescendants = graphDescendantsArray.reduce((allDesc, model) => ((allDesc[model.id] = model), allDesc), {});

        const keys = Object.keys(this.graphDescendants);
        const set = new Set(keys);
        if (keys.length !== set.size) {
            Core.InterfaceError.logError('Error: graph models have non-unique ids. You must to reboot your computer immediately!!!');
        }

        Object.values(this.graphDescendants).map(model => {
            const initialConfig = {};

            personalConfigProps.map(prop => {
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

        collectionsSet.forEach(coll => (coll.initialCollectionConfig = coll.map(m => m.id)));
    }

    // set given widget's diff config to configDiff array
    __setWidgetConfig(widgetId, keyValue) {
        const [key, value] = Object.entries(keyValue)[0];
        const initialValue = this.graphDescendants[widgetId].initialConfig[key];
        const isDefault = (() => {
            if (key === 'index') {
                const model = this.graphDescendants[widgetId];

                return value === model.collection.initialCollectionConfig.indexOf(model.id);
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
            //if we come to the situation where we return to initial state, we don't want to apply any changes
            if (this.configDiff[modelId] && objectsDeepComparison(this.configDiff[modelId], model.initialConfig)) {
                delete this.configDiff[modelId];
            }

            const config = this.configDiff[modelId] || model.initialConfig;

            if (Object.keys(config).length) {
                model.set(config);
            }

            personalConfigProps.filter(prop => config[prop] == null).map(prop => model.unset(prop));

            const collection = model.collection;
            if (collection) {
                const configIndex = config.index == null ? collection.initialCollectionConfig.indexOf(model.id) : config.index;
                if (configIndex != collection.indexOf(model)) {
                    this.configuredCollectionsSet.add(collection);
                }
            }
        });

        this.configuredCollectionsSet.forEach(coll => {
            this.__reorderCollectionByIndex(coll);
            if (coll.initialCollectionConfig.every((id, i) => coll.at(i).id === id)) {
                // that means collection returned to the inital state
                this.configuredCollectionsSet.delete(coll);
            }
        });
    }

    __reorderCollectionByIndex(collection) {
        const collIndexes = collection.map(model => model.id);
        const getModelsIndex = id => (this.configDiff[id]?.index != null ? this.configDiff[id].index : collection.initialCollectionConfig.indexOf(id));
        const collectionConfig = collection.map(model => model.id).sort((a, b) => getModelsIndex(a) - getModelsIndex(b));
        const groupsToReorder = collectionConfig
            // beautiful, clean and self-explanatory code don't need to be commented
            .reduce(
                (groupsAccumulator, currentId, i) => {
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
            .filter(group => group.length);

        const getConfigIndex = model => collectionConfig.indexOf(model.id);

        groupsToReorder.map(group => {
            const modelsGroup = [...collection.filter(model => group.includes(model.id))];
            const insertIndex = collection.indexOf(modelsGroup[0]);

            modelsGroup.sort((a, b) => getConfigIndex(a) - getConfigIndex(b));

            collection.remove(modelsGroup);
            collection.add(modelsGroup, { at: insertIndex });

            collection.trigger('columns:move', collectionConfig);
        });
    }
}
