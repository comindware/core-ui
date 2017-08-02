/**
 * Developer: Stepan Burguchev
 * Date: 2/28/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers } from 'utils';

const classes = {
    HIDDEN: 'layout__hidden'
};

export default Marionette.Behavior.extend({
    initialize(options, view) {
        //noinspection Eslint
        view.__updateState = this.__updateState.bind(this);

        this.__state = {};
    },

    __updateState() {
        const nextState = this.__computeViewState();
        if (this.__state.visible !== nextState.visible) {
            this.$el.toggleClass(classes.HIDDEN, !nextState.visible);
            this.view.trigger('change:visible', this.view, nextState.visible);
        }
        this.__state = nextState;
    },

    __computeViewState() {
        let visible = this.view.options.visible;
        visible = _.isFunction(visible) ? visible.call(this.view) : visible;
        if (_.isUndefined(visible)) {
            visible = true;
        }
        return {
            visible
        };
    }
});
