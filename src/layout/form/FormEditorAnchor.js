import { helpers } from 'utils';
import LayoutBehavior from '../behaviors/LayoutBehavior';

export default Marionette.ItemView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'key');
    },

    template: false,

    attributes() {
        return {
            'data-editors': this.options.key,
            'editor-for': this.options.uniqueFormId
        };
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onShow() {
        this.__updateState();
    },

    update() {
        this.__updateState();
    }
});
