import TreeEditorBehavior from '../behaviors/TreeEditorBehavior';

const requiredClass = 'star-of-life';

const getConfig = (template: string) => ({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || '',
            eyeIconClass: this.__getIconClass(),
            elementId: _.uniqueId('treeEditor_'),
            isDraggable: !!this.model.collection
        };
    },

    id() {
        return _.uniqueId('treeEditor_');
    },

    __getIconClass() {
        return this.model.get('required') ? requiredClass : this.model.get('isHidden') ? this.options.closedEyeIconClass : this.options.eyeIconClass;
    },

    behaviors: {
        TreeEditorBehavior: {
            behaviorClass: TreeEditorBehavior
        }
    }
});

export default getConfig;
