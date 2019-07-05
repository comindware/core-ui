import TreeEditorBehavior from '../behaviors/TreeEditorBehavior';

const requiredIconClass = 'lock';
const requiredClassName = 'required';

const getConfig = (template: string, className: string) => ({
    template: Handlebars.compile(template),

    attributes: {
        draggable: 'true'
    },

    className() {
        return `${className} ${this.model.get('required') ? requiredClassName : ''}`;
    },

    id() {
        return _.uniqueId('treeEditor_');
    },

    __getNodeName() {
        return typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || '';
    },

    __getIconClass() {
        return this.model.get('required') ? requiredIconClass : this.model.get('isHidden') ? this.options.closedEyeIconClass : this.options.eyeIconClass;
    },

    behaviors: {
        TreeEditorBehavior: {
            behaviorClass: TreeEditorBehavior
        }
    }
});

export default getConfig;
