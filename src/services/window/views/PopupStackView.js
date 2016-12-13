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

import { Handlebars, $ } from '../../../libApi';
import template from '../templates/PopupStack.hbs';

let classes = {
    POPUP_REGION: 'js-popup-region-',
    POPUP_FADE: 'popup-fade'
};

const POPUP_ID_PREFIX = 'popup-region-';

export default Marionette.LayoutView.extend({
    initialize () {
        this.__stack = [];
        this.__forceFadeBackground = false;
    },

    template: Handlebars.compile(template),

    ui: {
        fadingPanel: '.js-fading-panel'
    },

    showPopup (view, options) {
        let { fadeBackground, transient, hostEl } = options;

        let popupId = _.uniqueId(POPUP_ID_PREFIX);
        let regionEl = $(`<div data-popup-id="${popupId}" class="js-core-ui__global-popup-region">`);
        let parentPopupId = null;
        if (hostEl) {
            parentPopupId = $(hostEl).closest('.js-core-ui__global-popup-region').data('popup-id') || null;
        }
        let config = {
            view,
            options,
            regionEl,
            popupId,
            parentPopupId
        };

        if (parentPopupId) {
            // If there is a child popup, it must be closed:
            // 1. There might be nested dropdowns
            // 2. There can't be dropdowns opened on the same level
            let childPopupDef = this.__stack.find(x => x.parentPopupId === parentPopupId);
            if (childPopupDef) {
                this.closePopup(childPopupDef.popupId);
            }
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

        let targets;
        let popup = this.__stack.find(x => x.popupId === popupId);
        if (popup) {
            // All the children of the provided popup will also be closed
            targets = [ popup ];
            let handleChildren = (pId) => {
                let children = this.__stack.filter(x => x.parentPopupId === pId);
                targets.push(...children);
                children.forEach(c => handleChildren(c.popupId));
            };
            handleChildren(popupId);
        } else if (popupId) {
            // If we don't find the popup, it must have been closed so the job is done
            targets = [];
        } else {
            // We're popping the stack until we find an non-transient popup to close
            let index = 0;
            let lastNonTransient = _.last(this.__stack.filter(x => !x.options.transient));
            if (lastNonTransient) {
                index = this.__stack.indexOf(lastNonTransient);
            }
            targets = this.__stack.slice(index);
        }
        targets.forEach(popupDef => {
            this.removeRegion(popupDef.popupId);
            popupDef.regionEl.remove();
            this.__stack.splice(this.__stack.indexOf(popupDef), 1);
            this.trigger('popup:close', popupDef.popupId);
        });

        let lastFaded = _.last(this.__stack.filter(x => x.options.fadeBackground));
        if (lastFaded) {
            lastFaded.regionEl.addClass(classes.POPUP_FADE);
        } else {
            this.__toggleFadedBackground(this.__forceFadeBackground);
        }
    },

    get (popupId) {
        let index = this.__stack.findIndex(x => x.popupId === popupId);
        if (index === -1) {
            return [];
        }
        return this.__stack.slice(index).map(x => x.view);
    },

    fadeBackground (fade) {
        this.__forceFadeBackground = fade;
        this.__toggleFadedBackground(this.__forceFadeBackground || this.__stack.find(x => x.options.fadeBackground));
    },

    __toggleFadedBackground (fade) {
        this.ui.fadingPanel.toggleClass('fadingPanel_open', fade);
    }
});
