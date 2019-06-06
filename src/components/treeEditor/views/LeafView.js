import template from '../templates/leaf.hbs';
import eyeBehavior from '../behaviors/eyeBehavior';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.options.getNodeName && typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || '',
            eyeIconClass: this.model.get('isHidden') ? this.options.closedEyeIconClass : this.options.eyeIconClass
        };
    },

    id() {
        return _.uniqueId('treeEditor_');
    },

    behaviors: {
        eyeBehavior: {
            behaviorClass: eyeBehavior
        }
    },

    attributes: {
        draggable: 'true'
    },

    className: 'leaf-item tree-item'
});
