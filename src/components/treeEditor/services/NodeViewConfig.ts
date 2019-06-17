import TreeEditorBehavior from '../behaviors/TreeEditorBehavior';

const getConfig = (template: string) => ({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || '',
            eyeIconClass: this.model.get('isHidden') ? this.options.closedEyeIconClass : this.options.eyeIconClass,
            elementId: _.uniqueId('treeEditor_'),
            isDraggable: !!this.model.collection
        };
    },

    id() {
        return _.uniqueId('treeEditor_');
    },

    behaviors: {
        TreeEditorBehavior: {
            behaviorClass: TreeEditorBehavior
        }
    }
});

export default getConfig;
