import template from './templates/PopupStack.hbs';

const classes = {
    POPUP_REGION: 'js-popup-region-',
    POPUP_FADE: 'popup-fade'
};

const POPUP_ID_PREFIX = 'popup-region-';

const maxTransitionDelay = 1000;

export default Marionette.View.extend({
    initialize() {
        this.__stack = [];
        this.__forceFadeBackground = false;
    },

    template: Handlebars.compile(template),

    className: 'js-global-popup-stack',

    ui: {
        fadingPanel: '.js-fading-panel'
    },

    showPopup(view, options) {
        const { fadeBackground, transient, hostEl } = options;

        if (!transient) {
            this.__removeTransientPopups();
        }

        const popupId = _.uniqueId(POPUP_ID_PREFIX);
        const regionEl = document.createElement('div');
        regionEl.setAttribute('data-popup-id', popupId);
        regionEl.classList.add('js-core-ui__global-popup-region');
        regionEl.classList.add('core-ui__global-popup-region');

        let parentPopup;
        let parentPopupId = null;

        if (hostEl) {
            parentPopup = hostEl.closest && hostEl.closest('.js-core-ui__global-popup-region');
            parentPopupId = parentPopup ? parentPopup.getAttribute('popup-id') : null;
        }
        const config = {
            view,
            el: view.el,
            options,
            regionEl,
            popupId,
            parentPopupId
        };

        if (parentPopupId) {
            // If there is a child popup, it must be closed:
            // 1. There might be nested dropdowns
            // 2. There can't be dropdowns opened on the same level
            const childPopupDef = this.__stack.find(x => x.parentPopupId === parentPopupId);
            if (childPopupDef) {
                this.closePopup(childPopupDef.popupId);
            }
        }

        this.$el.append(regionEl);
        this.addRegion(popupId, {
            el: regionEl
        });

        view.once('attach', () =>
            requestAnimationFrame(() => {
                view.el.classList.add('presented-modal-window');
            })
        );
        this.getRegion(popupId).show(view);

        if (fadeBackground) {
            let lastIndex = -1;
            this.__stack.forEach((x, i) => (lastIndex = x.options.fadeBackground ? i : lastIndex));

            if (lastIndex !== -1) {
                this.__stack[lastIndex].regionEl.classList.remove(classes.POPUP_FADE);
            } else {
                this.__toggleFadedBackground(true);
            }
            regionEl.classList.add(classes.POPUP_FADE);
            this.topPopupId = popupId;
        }

        this.__stack.push(config);
        view.popupId = popupId;

        return popupId;
    },

    showElInPopup($el, options) {
        const { fadeBackground, transient, useWrapper } = options;

        if (!transient) {
            this.__removeTransientPopups();
        }

        const popupId = _.uniqueId(POPUP_ID_PREFIX);
        const regionEl = document.createElement('div');
        regionEl.setAttribute('data-popup-id', popupId);
        regionEl.classList.add('js-core-ui__global-popup-region');

        const el = $el.get(0);
        const prevSublingOfContentEl = $el.prev();

        const config = {
            view: $el,
            el,
            options,
            regionEl,
            popupId,
            prevSublingOfContentEl: prevSublingOfContentEl.length ? prevSublingOfContentEl : null,
            parentOfContentEl: prevSublingOfContentEl.length ? null: $el.parent(),
            parentPopupId: null
        };

        this.$el.append(regionEl);
        const region = this.addRegion(popupId, {
            el: regionEl
        });
        if (useWrapper) {
            const wrapper = document.createElement('div');
            wrapper.className = 'modal-window-wrapper';
            wrapper.appendChild(el);
            region.el.appendChild(wrapper);
        } else {
            region.el.appendChild(el);
        }

        if (fadeBackground) {
            let lastIndex = -1;
            this.__stack.forEach((x, i) => (lastIndex = x.options.fadeBackground ? i : lastIndex));

            if (lastIndex !== -1) {
                this.__stack[lastIndex].regionEl.classList.remove(classes.POPUP_FADE);
            } else {
                this.__toggleFadedBackground(true);
            }
            regionEl.classList.add(classes.POPUP_FADE);
            this.topPopupId = popupId;
        }

        this.__stack.push(config);
        $el.popupId = popupId;

        return popupId;
    },

    closePopup(popupId = null, immediate = false) {
        if (this.__stack.length === 0) {
            return;
        }

        let targets = [];
        const popupDef = this.__stack.find(x => x.popupId === popupId);
        if (popupDef) {
            if (!popupDef.options.transient) {
                this.__removeTransientPopups(immediate);
            }
            // All the children of the popup will also be closed
            // Important: we collect only logical children because another popup might have been opened at the same level already.
            // e.g.: focus-blur events (usually focus comes first) - one popup is opened on focus and the previous one is closed on blur.
            if (this.__stack.includes(popupDef)) {
                targets = [popupDef];
                const handleChildren = pId => {
                    const children = this.__stack.filter(x => x.parentPopupId === pId);
                    targets.push(...children);
                    children.forEach(c => handleChildren(c.popupId));
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
            this.__removeTransientPopups(immediate);
            const topMostNonTransient = this.__stack[this.__stack.length - 1];
            if (topMostNonTransient) {
                targets = [topMostNonTransient];
            }
        }
        targets.reverse().forEach(pd => {
            this.__removePopup(pd, immediate);
        });

        const filteredStackList = this.__stack.filter(x => x.options.fadeBackground);
        const lastElement = filteredStackList && filteredStackList[filteredStackList.length - 1];

        if (lastElement) {
            lastElement.regionEl.classList.add(classes.POPUP_FADE);
            this.topPopupId = lastElement.popupId;
            lastElement.el.focus();
        } else {
            this.topPopupId = undefined;
            this.__toggleFadedBackground(this.__forceFadeBackground);
        }
    },

    closeElPopup(popupId = null, immediate = false) {
        if (this.__stack.length === 0) {
            return;
        }

        let targets = [];
        const popupDef = this.__stack.find(x => x.popupId === popupId);
        if (popupDef) {
            if (!popupDef.options.transient) {
                this.__removeTransientPopups(immediate);
            }
            // All the children of the popup will also be closed
            // Important: we collect only logical children because another popup might have been opened at the same level already.
            // e.g.: focus-blur events (usually focus comes first) - one popup is opened on focus and the previous one is closed on blur.
            if (this.__stack.includes(popupDef)) {
                targets = [popupDef];
                const handleChildren = pId => {
                    const children = this.__stack.filter(x => x.parentPopupId === pId);
                    targets.push(...children);
                    children.forEach(c => handleChildren(c.popupId));
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
            this.__removeTransientPopups(immediate);
            const topMostNonTransient = this.__stack[this.__stack.length - 1];
            if (topMostNonTransient) {
                targets = [topMostNonTransient];
            }
        }
        if (popupDef.prevSublingOfContentEl) {
            popupDef.view.insertAfter(popupDef.prevSublingOfContentEl);
        } else {
            popupDef.view.prependTo(popupDef.parentOfContentEl);
        }

        targets.reverse().forEach(pd => this.__removePopup(pd, immediate));

        const filteredStackList = this.__stack.filter(x => x.options.fadeBackground);
        const lastElement = filteredStackList && filteredStackList[filteredStackList.length - 1];

        if (lastElement) {
            lastElement.regionEl.classList.add(classes.POPUP_FADE);
            this.topPopupId = lastElement.popupId;
        } else {
            this.topPopupId = undefined;
            this.__toggleFadedBackground(this.__forceFadeBackground);
        }
    },

    isPopupOnTop(popupId) {
        return this.topPopupId === popupId;
    },

    toggleFadeBackground(isToggleForced) {
        return this.fadeBackground(isToggleForced);
    },

    async closeTopPopup() {
        if (this.__stack.length === 0) {
            return;
        }
        const config = this.__stack[this.__stack.length - 1];
        if (!config.view.isNeedToPrevent?.()) {
            if (config.view.close) {
                const results = await config.view.close();
                if (results) {
                    config.options.showedInEl ? this.closeElPopup(config.popupId, config.options.immediateClosing) : this.closePopup(config.popupId);
                }
            } else {
                config.options.showedInEl ? this.closeElPopup(config.popupId, config.options.immediateClosing) : this.closePopup(config.popupId);
            }
        }
    },

    __removeTransientPopups(immediate) {
        this.__stack
            .filter(x => x.options.transient)
            .reverse()
            .forEach(popupDef => {
                this.__removePopup(popupDef, immediate);
            });
    },

    __removePopup(popupDef, immediate) {
        const popRemove = () => {
            if (popupDef.isRemoved) {
                return;
            }
            this.removeRegion(popupDef.popupId);
            this.el.removeChild(popupDef.regionEl);
            this.trigger('popup:close', popupDef.popupId);
            popupDef.isRemoved = true;
        };

        if (immediate) {
            popRemove();
        } else {
            const timeoutId = setTimeout(() => popRemove(), maxTransitionDelay);

            popupDef.el.addEventListener(
                'transitionend',
                () => {
                    clearTimeout(timeoutId);
                    popRemove();
                },
                { once: true }
            );
        }

        popupDef.view.el?.classList.remove('presented-modal-window');
        this.__stack.splice(this.__stack.indexOf(popupDef), 1);
    },

    get(popupId) {
        const index = this.__stack.findIndex(x => x.popupId === popupId);
        if (index === -1) {
            return [];
        }
        return this.__stack.slice(index).map(x => x.view);
    },

    getStack() {
        return this.__stack;
    },

    fadeBackground(fade) {
        this.__forceFadeBackground = fade;
        this.__toggleFadedBackground(this.__forceFadeBackground || this.__stack.some(x => x.options.fadeBackground));
    },

    __toggleFadedBackground(fade) {
        this.ui.fadingPanel.toggleClass('fadingPanel_open', fade);
    }
});
