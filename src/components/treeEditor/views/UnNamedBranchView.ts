import BranchView from './BranchView';
import template from '../templates/unNamedBranch.hbs';
import TreeEditorBehavior from '../behaviors/TreeEditorBehavior';

export default BranchView.extend({
    template: Handlebars.compile(template),

    className: 'unnamed-branch-item js-unnamed-tree-item',

    behaviors: {
        TreeEditorBehavior: {
            behaviorClass: TreeEditorBehavior
        }
    }
});
