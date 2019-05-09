import LayoutBehavior from '../behaviors/LayoutBehavior';
import Marionette from 'backbone.marionette';
import _ from 'underscore';

export default Marionette.View.extend({
    template: _.noop,

    attributes() {
        return {
            'data-fields': this.options.key,
            'field-for': this.options.uniqueFormId
        };
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
