import BranchView from './BranchView';
import template from '../templates/root.hbs';

export default BranchView.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || ''
        };
    },

    behaviors: {},

    id() {
        return _.uniqueId('treeEditor-root_');
    },

    attributes: {},

    className: {},

    __getIconClass() {}
});
