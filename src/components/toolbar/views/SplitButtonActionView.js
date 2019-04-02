import { getClassName } from '../meta';
import ActionView from './ActionView';

export default ActionView.extend({
    initialize(options = {}) {
        this.model = options.model;
    },

    className() {
        return getClassName('split-button-action-button', this.model);
    },

    __handleClick() {
        this.trigger('action:click', this.model);
    }
});
