import DiffItem from './DiffItem';
import BaseDiffMap from './BaseDiffMap';
import { TreeConfig, NodeConfig } from '../types';

type paramType = Parameters<typeof _.isEqual> | Map<any, any>;

const isEqualExtended = (a: paramType, b: paramType) => {
    if (!(a instanceof Map && b instanceof Map)) {
        return _.isEqual(a ,b);
    }

    if (a.size !== b.size) {
        return false;
    }

    for (const key of a.keys()) {
        if (!b.has(key) || !isEqualExtended(b.get(key), a.get(key))) {
            return false;
        }
    }

    return true;
};

export default class ConfigDiff extends BaseDiffMap<DiffItem> {
    initialConfig: TreeConfig;
    constructor(initialConfig: TreeConfig) {
        super();
        this.initialConfig = initialConfig;
    }

    set(key: string, value: NodeConfig) {
        const initItem = this.initialConfig.get(key);

        if (!initItem) {
            Core.InterfaceError.logError(`Error: the initial config's Map doesn't have an entry with the s key. This shouldn't be happen.`);

            return this;
        }

        const diffItem = this.get(key) || new DiffItem(initItem.initialConfig);

        Object.entries(value).forEach(entry => {
            diffItem.set(...entry);
        });

        if (isEqualExtended(diffItem, initItem)) {
            this.delete(key);

            return this;
        }

        return super.set(key, diffItem);
    }

    renameKeys(replacer: (key: string) => string) {
        const mappedInitialConfig = new Map();

        this.initialConfig.forEach((value, key) => {
            mappedInitialConfig.set(replacer(key), value);
        });

        const mappedConfig = new ConfigDiff(mappedInitialConfig);

        this.forEach((value, key) => {
            super.set.call(mappedConfig, replacer(key), value);
        });

        return mappedConfig;
    }

    mapChildsToObjects() {
        // let rrr = config.renameKeys(key => key.replace(keyReplaceRegExp, ''))
        const newMap = new Map();

        this.forEach((value: DiffItem, key: string) => {
            newMap.set(key, value.toObject())
        });

        return newMap;
        // const obj: NodeConfig = {};

        // this.forEach((diff: DiffItem, key: string) => {
        //     obj[key] = diff.toObject();
        // });

        // return obj;


        //return //Array.from(this).reduce((obj: NodeConfig , [key, value]) => ((obj[key] = value), obj), {});
    }
}
