/**
 * Developer: Ksenia Kartvelishvili
 * Date: 9/9/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

'use strict';

import { Handlebars } from '../../../libApi';
import template from '../templates/PopupStack.hbs';
import GlobalEventService from '../../GlobalEventService';

let classes = {
    POPUP_REGION: 'js-popup-region-',
    POPUP_FADE: 'popup-fade'
};

const POPUP_ID_PREFIX = 'popup-region-';
const THROTTLE_DELAY = 100;

export default Marionette.LayoutView.extend({
    initialize () {
        this.__stack = [];

        let checkTransientPopups = _.throttle(this.__checkTransientPopups.bind(this), THROTTLE_DELAY);
        this.listenTo(GlobalEventService, 'window:wheel:captured', checkTransientPopups);
        this.listenTo(GlobalEventService, 'window:mouseup:captured', checkTransientPopups);
        this.listenTo(GlobalEventService, 'window:keydown:captured', checkTransientPopups);
    },

    template: Handlebars.compile(template),

    ui: {
        fadingPanel: '.js-fading-panel'
    },

    showPopup (view, options) {
        let { fadeBackground, transient, anchorEl } = options;

        let regionEl = $('<div>');
        let popupId = _.uniqueId(POPUP_ID_PREFIX);
        let config = {
            view,
            options,
            regionEl,
            popupId
        };

        if (transient && anchorEl) {
            // saving el position relative to the viewport for further check
            let { left, top } = anchorEl.getBoundingClientRect();
            config.anchorViewportPos = {
                left: Math.floor(left),
                top: Math.floor(top)
            };
        }

        this.$el.append(regionEl);
        this.addRegion(popupId, { el: regionEl });
        this.getRegion(popupId).show(view);

        if (fadeBackground) {
            let lastFaded = _.last(this.__stack.filter(x => x.options.fadeBackground));
            if (lastFaded) {
                lastFaded.regionEl.removeClass(classes.POPUP_FADE);
            } else {
                this.__toggleFadedBackground(true);
            }
            regionEl.addClass(classes.POPUP_FADE);
        }

        this.__stack.push(config);
        return popupId;
    },

    closePopup (popupId = null) {
        if (this.__stack.length === 0) {
            return;
        }

        let index = 0;
        if (popupId) {
            index = this.__stack.findIndex(x => x.popupId === popupId);
        } else {
            // We're popping the stack until we find an non-transient popup to close
            let lastNonTransient = _.last(this.__stack.filter(x => !x.options.transient));
            if (lastNonTransient) {
                index = this.__stack.indexOf(lastNonTransient);
            }
        }
        if (index !== -1) {
            while (this.__stack.length > index) {
                let popupDef = this.__stack.pop();
                this.removeRegion(popupDef.popupId);
                popupDef.regionEl.remove();
            }
        }

        let lastFaded = _.last(this.__stack.filter(x => x.options.fadeBackground));
        if (lastFaded) {
            lastFaded.regionEl.addClass(classes.POPUP_FADE);
        } else {
            this.__toggleFadedBackground(false);
        }
    },

    __checkTransientPopups () {
        setTimeout(() => {
            let movedTransientPopup = this.__stack.find(x => {
                if (x.options.transient && x.options.anchorEl) {
                    let { left, top } = x.options.anchorEl.getBoundingClientRect();
                    if (Math.floor(left) !== x.anchorViewportPos.left || Math.floor(top) !== x.anchorViewportPos.top) {
                        return true;
                    }
                }
                return false;
            });
            if (movedTransientPopup) {
                this.closePopup(movedTransientPopup.popupId);
            }
        }, 50);
    },

    __toggleFadedBackground (fade) {
        this.ui.fadingPanel.toggleClass('fadingPanel_open', fade);
    }
});
