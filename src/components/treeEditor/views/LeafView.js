import template from '../templates/leaf.hbs';
import eyeBehavior from '../behaviors/eyeBehavior';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.model.get('name'),
            eyeIconClass: this.model.get('isHidden') ? this.options.closedEyeIconClass : this.options.eyeIconClass
        };
    },

    attributes: {
        draggable: 'true'
    },

    id() {
        return _.uniqueId('treeEditor_');
    },

    className: 'leaf-item tree-item',

    behaviors: {
        eyeBehavior: {
            behaviorClass: eyeBehavior
        }
    }
});
