import BaseDiffMap from './BaseDiffMap';
import { NodeConfig, SingleItem } from '../types';

const defaultConfig = {
    isHidden: false,
    width: 0
};

export default class DiffItem extends BaseDiffMap<NodeConfig> {
    initialConfig: NodeConfig;
    constructor(optionConfig: NodeConfig) {
        super();

        this.__initialize(optionConfig);
    }

    __initialize(optionConfig: NodeConfig) {
        this.initialConfig = _.defaults(optionConfig, defaultConfig);
    }

    set(key: string, value: SingleItem) {
        // eslint-disable-next-line eqeqeq
        if (value == undefined || _.isEqual(value, this.initialConfig[key])) {
            this.delete(key);

            return this;
        }

        return super.set(key, value);
    }

    toObject() {
        return Object.fromEntries(this);
    }
}
