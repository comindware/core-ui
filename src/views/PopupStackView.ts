import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import _ from 'underscore';

interface StackViewOptions {
    fadeBackground: boolean;
    transient: boolean;
    hostEl: HTMLElement;
}

interface StackViewConfiguration {
    view: Marionette.View<any>;
    options: StackViewOptions;
    regionEl: HTMLElement;
    popupId: string;
    parentPopupId?: string;
}

const classes = {
    POPUP_REGION: 'js-popup-region-',
    POPUP_FADE: 'popup-fade'
};

const POPUP_ID_PREFIX = 'popup-region-';

export default Marionette.View.extend({
    initialize() {
        this.__stack = [];
        this.__forceFadeBackground = false;
    },

    className: 'fadingPanel js-fading-panel',

    template: false,

    showPopup(view: Marionette.View<any>, options: StackViewOptions) {
        const { fadeBackground, transient, hostEl } = options;

        if (!transient) {
            this.__removeTransientPopups();
        }

        const popupId = _.uniqueId(POPUP_ID_PREFIX);
        const regionEl = document.createElement('div');
        regionEl.setAttribute('data-popup-id', popupId);
        regionEl.classList.add('js-core-ui__global-popup-region');

        let parentPopup;
        let parentPopupId: string | null = null;

        if (hostEl) {
            parentPopup = hostEl.closest && hostEl.closest('.js-core-ui__global-popup-region');
            parentPopupId = parentPopup ? parentPopup.getAttribute('popup-id') : null;
        }
        const config = {
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
            const childPopupDef = this.__stack.find((x: StackViewConfiguration) => x.parentPopupId === parentPopupId);
            if (childPopupDef) {
                this.closePopup(childPopupDef.popupId);
            }
        }

        Backbone.$(document.body).append(regionEl);
        this.addRegion(popupId, {
            el: regionEl
        });
        this.getRegion(popupId).show(view);

        if (fadeBackground) {
            let lastIndex = -1;
            this.__stack.forEach((x: StackViewConfiguration, i: number) => (lastIndex = x.options.fadeBackground ? i : lastIndex));

            if (lastIndex !== -1) {
                this.__stack[lastIndex].regionEl.classList.remove(classes.POPUP_FADE);
            } else {
                this.__toggleFadedBackground(true);
            }
            regionEl.classList.add(classes.POPUP_FADE);
            this.topPopupId = popupId;
        }

        this.__stack.push(config);
        // @ts-ignore
        view.popupId = popupId;

        return popupId;
    },

    closePopup(popupId = null) {
        if (this.__stack.length === 0) {
            return;
        }

        let targets = [];
        const popupDef = this.__stack.find((x: StackViewConfiguration) => x.popupId === popupId);
        if (popupDef) {
            if (!popupDef.options.transient) {
                this.__removeTransientPopups();
            }
            // All the children of the popup will also be closed
            // Important: we collect only logical children because another popup might have been opened at the same level already.
            // e.g.: focus-blur events (usually focus comes first) - one popup is opened on focus and the previous one is closed on blur.
            if (this.__stack.includes(popupDef)) {
                targets = [popupDef];
                const handleChildren = (pId: string | null) => {
                    const children = this.__stack.filter((x: StackViewConfiguration) => x.parentPopupId === pId);
                    targets.push(...children);
                    children.forEach((c: StackViewConfiguration) => handleChildren(c.popupId));
                };
                handleChildren(popupId);
            } else {
                targets = [];
            }
        } else if (popupId) {
            // If we don't find the popup, it must have been closed so the job is done
            targets = [];
        } else {
            // Close all transient popups and the top-most non-transient
            this.__removeTransientPopups();
            const topMostNonTransient = this.__stack[this.__stack.length - 1];
            if (topMostNonTransient) {
                targets = [topMostNonTransient];
            }
        }
        targets.reverse().forEach(pd => {
            this.__removePopup(pd);
        });

        const filteredStackList = this.__stack.filter((x: StackViewConfiguration) => x.options.fadeBackground);
        const lastElement = filteredStackList && filteredStackList[filteredStackList.length - 1];

        if (lastElement) {
            lastElement.regionEl.classList.add(classes.POPUP_FADE);
            this.topPopupId = lastElement.popupId;
        } else {
            this.topPopupId = undefined;
            this.__toggleFadedBackground(this.__forceFadeBackground);
        }
    },

    isPopupOnTop(popupId: string) {
        return this.topPopupId === popupId;
    },

    async closeTopPopup() {
        if (this.__stack.length === 0) {
            return;
        }
        const config = this.__stack[this.__stack.length - 1];
        if (!config.view.__isNeedToPrevent || !config.view.__isNeedToPrevent()) {
            if (config.view.close) {
                const results = await config.view.close();
                if (results) {
                    this.closePopup(config.popupId);
                }
            } else {
                this.closePopup(config.popupId);
            }
        }
    },

    get(popupId: string) {
        const index = this.__stack.findIndex((x: StackViewConfiguration) => x.popupId === popupId);
        if (index === -1) {
            return [];
        }
        return this.__stack.slice(index).map((x: StackViewConfiguration) => x.view);
    },

    getStack() {
        return this.__stack;
    },

    fadeBackground(fade: boolean) {
        this.__forceFadeBackground = fade;
        this.__toggleFadedBackground(this.__forceFadeBackground || this.__stack.find((x: StackViewConfiguration) => x.options.fadeBackground));
    },

    __removeTransientPopups() {
        this.__stack
            .filter((x: StackViewConfiguration) => x.options.transient)
            .reverse()
            .forEach((popupDef: StackViewOptions) => this.__removePopup(popupDef));
    },

    __removePopup(popupDef: StackViewConfiguration) {
        this.removeRegion(popupDef.popupId);
        document.body.removeChild(popupDef.regionEl);
        this.__stack.splice(this.__stack.indexOf(popupDef), 1);
        this.trigger('popup:close', popupDef.popupId);
    },

    __toggleFadedBackground(fade: boolean) {
        this.$el.toggleClass('fadingPanel_open', fade);
    }
});
