import BranchView from './BranchView';
import template from '../templates/unNamedBranch.hbs';

export default BranchView.extend({
    template: Handlebars.compile(template),

    className: 'unnamed-branch-item js-unnamed-tree-item'
});
