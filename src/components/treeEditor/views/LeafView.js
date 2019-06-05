import template from '../templates/leaf.hbs';
import eyeBehavior from '../behaviors/eyeBehavior';

export default Marionette.View.extend({
    replaceElement: true,

    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.model.get('name')
        };
    },

    className: 'leaf-item',

    behaviors: {
        eyeBehavior: {
            behaviorClass: eyeBehavior
        }
    }
});
