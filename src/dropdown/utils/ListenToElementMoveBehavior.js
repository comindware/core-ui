/**
 * Developer: Stepan Burguchev
 * Date: 11/15/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import GlobalEventService from '../../services/GlobalEventService';

const THROTTLE_DELAY = 100;

export default Marionette.Behavior.extend({
    initialize(options, view) {
        this.__observedEntities = [];
        this.__checkElements = _.throttle(this.__checkElements.bind(this), THROTTLE_DELAY);

        view.listenToElementMoveOnce = this.__listenToElementMoveOnce.bind(this);
        view.stopListeningToElementMove = this.__stopListeningToElementMove.bind(this);
    },

    __listenToElementMoveOnce(el, callback) {
        if (this.__observedEntities.length === 0) {
            this.listenTo(GlobalEventService, 'window:wheel:captured', this.__checkElements);
            this.listenTo(GlobalEventService, 'window:mouseup:captured', this.__checkElements);
            this.listenTo(GlobalEventService, 'window:keydown:captured', this.__checkElements);
        }

        // saving el position relative to the viewport for further check
        const { left, top } = el.getBoundingClientRect();
        this.__observedEntities.push({
            anchorViewportPos: {
                left: Math.floor(left),
                top: Math.floor(top)
            },
            el,
            callback
        });
    },

    __stopListeningToElementMove(el = null) {
        if (!el) {
            this.__observedEntities = [];
        } else {
            this.__observedEntities.splice(this.__observedEntities.findIndex(x => x.el === el), 1);
        }
    },

    __checkElements() {
        setTimeout(() => {
            if (this.view.isDestroyed) {
                return;
            }
            this.__observedEntities.forEach(x => {
                const { left, top } = x.el.getBoundingClientRect();
                if (Math.floor(left) !== x.anchorViewportPos.left || Math.floor(top) !== x.anchorViewportPos.top) {
                    x.callback.call(this.view);
                }
            });
        }, 50);
    }
});
