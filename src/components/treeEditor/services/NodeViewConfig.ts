import TreeEditorBehavior from '../behaviors/TreeEditorBehavior';

const requiredIconClass = 'star-of-life';

const getConfig = (template: string, className: string) => ({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || '',
            eyeIconClass: this.__getIconClass(),
            elementId: _.uniqueId('treeEditor_'),
            isDraggable: !!this.model.collection
        };
    },

    className() {
        return `${className} ${this.model.get('required') ? 'required' : ''}`;
    },

    id() {
        return _.uniqueId('treeEditor_');
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
