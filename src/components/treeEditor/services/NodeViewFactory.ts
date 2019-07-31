import BranchView from '../views/BranchView';
import RootView from '../views/RootView';
import RootViewWithToolbar from '../views/RootViewWithToolbar';
import LeafView from '../views/LeafView';
import EmptyView from '../views/EmptyView';
import UnNamedBranchView from '../views/UnNamedBranchView';
import { RootViewFactoryOptions, NodeViewFactoryOptions } from '../types';

export default {
    getRootView(config: RootViewFactoryOptions) {
        if (config.showToolbar) {
            return RootViewWithToolbar;
        }

        return RootView;
    },

    getNodeView(config: NodeViewFactoryOptions) {
        const { model, unNamedType, nestingOptions } = config;
        const { stopNestingType, forceBranchType, forceLeafType } = nestingOptions;

        const type = model.get('type');
        const fieldType = model.get('fieldType');

        const getIsForceType = (forceType?: string[] | string) => {
            if (!forceType) {
                return;
            }

            const result = Array.isArray(forceType) ? forceType.includes(type) || forceType.includes(fieldType) : type === forceType || fieldType === forceType;

            return result;
        };

        const isForcedBranch = getIsForceType(forceBranchType);
        const isForcedLeaf = getIsForceType(forceLeafType);

        const nestingAllowed =
            !stopNestingType ||
            (() => {
                const modelParent = model.getParent;
                if (!modelParent) {
                    return false;
                }

                return modelParent().get('type') !== stopNestingType || modelParent().get('fieldType') !== stopNestingType;
            })(); // TODO think about passing an optional getNodeView

        const isBranchView = isForcedBranch || nestingAllowed;

        if (!model.isContainer || isForcedLeaf) {
            return LeafView;
        }

        const collection = model.get(model.childrenAttribute);
        if (!collection.length) {
            return EmptyView;
        }

        if (unNamedType && type === unNamedType) {
            return UnNamedBranchView;
        }

        if (isBranchView) {
            return BranchView;
        }
    }
};
