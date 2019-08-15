import BranchView from './BranchView';
import template from '../templates/unNamedBranch.hbs';
import NodeBehavior from '../behaviors/NodeBehavior';

export default BranchView.extend({
    template: Handlebars.compile(template),

    className: 'unnamed-branch-item js-unnamed-tree-item',

    behaviors: {
        NodeBehavior: {
            behaviorClass: NodeBehavior
        }
    }
});
