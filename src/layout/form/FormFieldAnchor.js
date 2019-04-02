// @flow
import { helpers } from 'utils';
import LayoutBehavior from '../behaviors/LayoutBehavior';

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'key');
    },

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
