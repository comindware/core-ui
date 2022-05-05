import LayoutBehavior from '../behaviors/LayoutBehavior';
import Marionette from 'backbone.marionette';

export default Marionette.View.extend({
    template: _.noop,

    attributes() {
        return {
            [`data-${this.options.kind}s`]: this.options.key,
            [`${this.options.kind}-for`]: this.options.uniqueFormId
        };
    },

    className() {
        return `form-field form-field_${this.options.type?.split('-')?.[0].toLowerCase()}`;
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onRender() {
        this.__updateState();
    },

    update() {
        this.__updateState();
    },

    validate() {
        if (this.isRendered() && !this.isDestroyed()) {
            return !!this.el.getElementsByClassName('js-editor_error').length;
        }
    }
});
