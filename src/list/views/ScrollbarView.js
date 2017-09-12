/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import template from '../templates/scrollbar.hbs';

/*
    Public interface:

    This view produce:
        trigger: positionChanged (sender, { oldPosition, position })
    This view react on:
        collection change (via Backbone.Collection events)
        position change (when we scroll content view somehow without this scrollbar): updatePosition(newPosition)
        viewportHeight change (when we resize content views attached to this scrollbar): updateViewportHeight(newViewportHeight)
*/

/**
 * Some description for initializer
 * @name ScrollBarView
 * @memberof module:core.list.views
 * @class ScrollBarView
 * @extends Marionette.ItemView
 * @constructor
 * @description View Scrollbar'а
 * @param {Object} options Constructor options
 * */
const ScrollbarView = Marionette.ItemView.extend({
    initialize() {
        if (this.collection === undefined) {
            throw new Error('You must provide a collection to display.');
        }

        _.bindAll(this, '__documentMouseUp', '__documentMouseMove');
        this.$document = $(document);
        this.state = {
            position: 0,
            viewportHeight: 25,
            count: 0
        };

        this.__updateCount(this.collection.length);
    },

    className: 'scrollbar',
    template: Handlebars.compile(template),
    model: null,
    state: null,
    dragContext: null,

    ui: {
        dragger: '.dragger'
    },

    constants: {
        minDraggerHeight: 25 // in pixels
    },

    collectionEvents: {
        add: '__handleCollectionAdd',
        remove: '__handleCollectionRemove',
        reset: '__handleCollectionReset'
    },

    events: {
        mousewheel: '__mousewheel',
        mousedown: '__mousedown',
        mouseenter: '__mouseenter',
        mouseleave: '__mouseleave',
        'mousedown @ui.dragger': '__draggerMousedown'
    },

    onShow() {
        this.rendered = true;
        this.__updateScrollbarVisibility();
        this.__updateScrollbarVisibility();
        this.__updateDraggerPosition();
        this.__updateDraggerHeight();
    },

    onRender() {
        function stopAndPreventDefault(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.el.onselectstart = stopAndPreventDefault;
        this.el.ondragstart = stopAndPreventDefault;
    },

    updateViewportHeight(newViewportHeight) {
        if (newViewportHeight === undefined) {
            throw new Error('newViewportHeight is undefined');
        }

        if (newViewportHeight < 1) {
            throw new Error('newViewportHeight is invalid');
        }

        if (!this.rendered) {
            this.state.viewportHeight = newViewportHeight;
            return;
        }

        if (this.state.viewportHeight !== newViewportHeight) {
            this.state.viewportHeight = newViewportHeight;
            this.__updateScrollbarVisibility();
            this.__updateDraggerHeight();

            const maxPos = this.__getMaxPosition();
            if (this.state.position > maxPos) {
                this.__updatePositionState(maxPos, true);
                this.__updateDraggerPosition();
            }
        }
    },

    updatePosition(newPosition) {
        this.__updatePositionInternal(newPosition, false);
    },

    __updateCount(newCount) {
        if (newCount === undefined) {
            throw new Error('newCount is undefined');
        }

        if (newCount < 0) {
            throw new Error('newCount is invalid');
        }

        if (!this.rendered) {
            this.state.count = newCount;
            return;
        }

        if (this.state.count !== newCount) {
            const maxPos = this.__getMaxPosition();
            const newMaxPos = Math.max(0, maxPos - (this.state.count - newCount));

            if (this.state.position > newMaxPos) {
                this.__updatePositionState(newMaxPos, true);
            }

            this.state.count = newCount;
            this.__updateScrollbarVisibility();
            this.__updateDraggerHeight();
            this.__updateDraggerPosition();
        }
    },

    // normalizes new position into [min,max] and updates view+state
    __updatePositionInternal(newPosition, triggerEvents) {
        if (newPosition === undefined) {
            throw new Error('newPosition is undefined');
        }

        if (!this.rendered) {
            this.state.position = newPosition;
            return;
        }

        const position = Math.max(0, Math.min(this.__getMaxPosition(), newPosition));
        if (this.state.position !== position) {
            this.__updatePositionState(position, triggerEvents);
            this.__updateDraggerPosition();
        }

        return position;
    },

    __handleCollectionAdd(model, collection) {
        this.__updateCount(collection.length);
    },

    __handleCollectionRemove(model, collection) {
        this.__updateCount(collection.length);
    },

    __handleCollectionReset(collection) {
        this.__updateCount(collection.length);
    },

    __mouseenter() {
        this.$el.addClass('hover');
    },

    __mouseleave() {
        this.$el.removeClass('hover');
    },

    __draggerMousedown(e) {
        this.__stopDrag();
        this.__startDrag(e);
        return false;
    },

    __documentMouseMove(e) {
        if (!this.dragContext) {
            return;
        }

        const ctx = this.dragContext;
        if (e.pageY !== ctx.pageOffsetY) {
            const availableHeight = ctx.scrollbarHeight - ctx.draggerHeight;
            const currentPosition = e.pageY - ctx.mouseOffsetY - ctx.scrollbarPositionY;
            const newDraggerTop = Math.min(Math.max(currentPosition, 0), availableHeight);

            const devicePercents = newDraggerTop / ctx.scrollbarHeight * 100;
            this.ui.dragger.css({ top: `${devicePercents}%` });

            // updating scrollbar state, sending positionChanged event if needed
            const maxPos = this.__getMaxPosition();
            const newPosition = availableHeight !== 0 ? Math.min(maxPos, Math.floor((maxPos + 1) * (newDraggerTop / availableHeight))) : 0;
            this.__updatePositionState(newPosition, true);
        }

        return false;
    },

    __documentMouseUp() {
        this.__stopDrag();
        return false;
    },

    __mousedown(e) {
        if (e.target !== e.currentTarget) {
            return false;
        }

        const draggerY = this.__getPosition(this.ui.dragger).y;
        let sign = e.pageY - draggerY;
        sign /= Math.abs(sign);

        const delta = this.state.viewportHeight;
        const newPosition = this.state.position + sign * delta;
        this.__updatePositionInternal(newPosition, true);
        return false;
    },

    __mousewheel(e) {
        const delta = this.state.viewportHeight;
        const newPosition = this.state.position - e.deltaY * Math.max(1, Math.floor(delta / 6));
        this.__updatePositionInternal(newPosition, true);
        return false;
    },

    __updatePositionState(newPosition, triggerEvents) {
        if (this.state.position === newPosition) {
            return;
        }

        const oldPosition = this.state.position;
        this.state.position = newPosition;
        if (triggerEvents) {
            this.trigger('positionChanged', this, {
                oldPosition,
                position: newPosition
            });
        }
    },

    __updateScrollbarVisibility() {
        if (this.state.count > this.state.viewportHeight) {
            this.$el.parent().removeClass('dev-scrollbar__hidden');
        } else {
            this.$el.parent().addClass('dev-scrollbar__hidden');
        }
    },

    __updateDraggerHeight() {
        const minHeight = Math.min(1, this.constants.minDraggerHeight / this.$el.height());
        const heightPc = Math.max(minHeight, Math.min(1, this.state.viewportHeight / this.state.count)) * 100;
        this.ui.dragger.css({ height: `${heightPc}%` });
    },

    __updateDraggerPosition() {
        let newTopPc;
        const maxPos = this.__getMaxPosition();
        if (maxPos > 0) {
            const h = this.$el.height();
            const dh = this.ui.dragger.height();
            const availableHeight = h - dh;
            const newTop = this.state.position / this.__getMaxPosition() * availableHeight;
            newTopPc = newTop / h * 100;
        } else {
            newTopPc = 0;
        }

        this.ui.dragger.css({ top: `${newTopPc}%` });
    },

    __getMaxPosition() {
        return Math.max(0, (this.state.count - 1) - this.state.viewportHeight + 1);
    },

    __startDrag(event) {
        this.dragContext = {
            scrollbarHeight: this.$el.height(),
            draggerHeight: this.ui.dragger.height(),
            pageOffsetY: event.pageY,
            scrollbarPositionY: this.__getPosition(this.el).y,
            mouseOffsetY: event.pageY - this.__getPosition(this.ui.dragger).y
        };

        this.ui.dragger.addClass('active');
        $(document).mousemove(this.__documentMouseMove).mouseup(this.__documentMouseUp);
    },

    __stopDrag() {
        if (!this.dragContext) {
            return;
        }

        this.dragContext = null;
        this.$document.unbind('mousemove', this.__documentMouseMove);
        this.$document.unbind('mouseup', this.__documentMouseUp);
        this.ui.dragger.removeClass('active');
    },

    // returns DOM element position relatively to the document
    __getPosition(elem) {
        let domElement = elem;
        if (domElement instanceof jQuery) {
            domElement = domElement[0];
        }

        let left = 0;
        let top = 0;
        do {
            if (!isNaN(domElement.offsetLeft)) {
                left += domElement.offsetLeft;
            }
            if (!isNaN(domElement.offsetTop)) {
                top += domElement.offsetTop;
            }
            domElement = domElement.offsetParent;
        } while (domElement);
        return { x: left, y: top };
    }
});

export default ScrollbarView;
