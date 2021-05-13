import WindowService from '../../services/WindowService';
import GlobalEventService from '../../services/GlobalEventService';

const THROTTLE_DELAY = 100;

const classes = {
    OPEN: 'open',
    DROPDOWN_DOWN: 'dropdown__wrp_down',
    DROPDOWN_WRP_OVER: 'dropdown__wrp_down-over',
    DROPDOWN_UP: 'dropdown__wrp_up',
    DROPDOWN_UP_OVER: 'dropdown__wrp_up-over',
    VISIBLE_COLLECTION: 'visible-collection',
    CUSTOM_ANCHOR_BUTTON: 'popout__action-btn',
    DEFAULT_ANCHOR_BUTTON: 'popout__action',
    DEFAULT_ANCHOR: 'angle-down'
};

const WINDOW_BORDER_OFFSET = 10;
const MIN_DROPDOWN_PANEL_WIDTH = 100;
const MIN_HEIGHT_TO_OPEN_DOWN = 300;

enum popoutFlow {
    LEFT = 'left',
    RIGHT = 'right'
};

enum panelPosition {
    DOWN = 'down',
    UP = 'up',
    RIGHT = 'right'
};

type optionsType = {
    popoutFlow?: popoutFlow,
    autoOpen?: boolean,
    renderAfterClose?: boolean,
    panelPosition?: panelPosition,
    panelMinWidth?: number,
    allowNestedFocus?: boolean,
    externalBlurHandler?: Function,
    panelViewOptions?: object,
    buttonViewOptions?: object,
    showDropdownAnchor?: boolean,
    customAnchor?: boolean,
    fadeBackground?: boolean
};

const defaultOptions: optionsType = {
    popoutFlow: popoutFlow.LEFT,
    autoOpen: true,
    renderAfterClose: true,
    panelPosition: panelPosition.DOWN,
    panelOffsetLeft: 0,
    panelMinWidth: MIN_DROPDOWN_PANEL_WIDTH,
    allowNestedFocus: true,
    externalBlurHandler: () => false,
    showDropdownAnchor: false,
    customAnchor: false,
    fadeBackground: false
};

/**
 * @name DropdownView
 * @memberof module:core.dropdown.views
 * @class Composite View that implements dropdown logic similar to SELECT HTML-element.
 * Unlike {@link module:core.dropdown.views.PopoutView PopoutView}, a panel doesn't have a speech bubble triangle and
 * it's min-width is always determined and equal to the width of a button view.
 *
 * A dropdown view contains button and panel regions that can be fully customizable by the properties <code>buttonView</code> and <code>panelView</code>.
 * <ul>
 * <li>Button View is used for displaying a button. Click on that button trigger a panel to open.</li>
 * <li>Panel View is used to display a panel that drops down.</li>
 * </ul>
 *
 * Panel width is determined by its layout but it cannot be less than the button's width. Panel height is fully determined by its layout.
 * A place where the panel appears depends on the <code>panelPosition</code> option.<br/>
 * Possible events:<ul>
 * <li><code>'open' (dropdownView)</code> - fires after the panel has opened.</li>
 * <li><code>'close' (dropdownView, ...)</code> - fires after the panel has closed.
 * If the panel was closed via <code>close(...)</code> method, the arguments of this method are transferred into this event.</li>
 * <li><code>'button:\*' </code> - all events the buttonView triggers are repeated by this view with 'button:' prefix.</li>
 * <li><code>'panel:\*' </code> - all events the panelView triggers are repeated by this view with 'panel:' prefix.</li>
 * </ul>
 * @constructor
 * @param {Object} options Options object.
 * @param {Marionette.View} options.buttonView View class for displaying the button.
 * @param {(Object|Function)} [options.buttonViewOptions] Options passed into the view on its creation.
 * @param {Marionette.View} options.panelView View class for displaying the panel. The view is created every time the panel is triggered to open.
 * @param {(Object|Function)} [options.panelViewOptions] Options passed into the view on its creation.
 * @param {Boolean} [options.autoOpen=true] Whether click on the button should trigger the panel to open.
 * @param {String} [options.panelPosition='down'] Opening direction:
 *       <ul><li><code>'down'</code> - opens down.</li>
 *       <li><code>'down-over'</code> - opens down and the panel is located above the button overlapping it.</li>
 *       <li><code>'up'</code> - opens up.</li>
 *       <li><code>'up-over'</code> - opens up and the panel is located above the button overlapping it.</li></ul>
 * @param {Boolean} [options.renderAfterClose=true] Whether to trigger button render when the panel has closed.
 * */

const getClass = (options: optionsType) => {
    const classList = [];
    if (options.buttonViewOptions?.class) {
        classList.push(options.buttonViewOptions.class);
    }
    if (options.class) {
        classList.push(options.class);
    }
    return classList.join(' ');
};

export default class DropdownView {
    constructor(options: optionsType) {
        this.options = _.defaults({}, options, defaultOptions);

        this.__observedEntities = [];
        this.maxWidth = options.panelViewOptions && options.panelViewOptions.maxWidth ? options.panelViewOptions.maxWidth : 0;
        this.__checkElements = _.throttle(this.__checkElements.bind(this), THROTTLE_DELAY);

        this.button = new this.options.buttonView(
            Object.assign(
                {
                    parent: this
                },
                this.options.buttonViewOptions,
                {
                    class: getClass(this.options)
                }
            )
        );
        this.button.close = this.close.bind(this);
        this.button.open = this.open.bind(this);
        this.button.adjustPosition = this.adjustPosition.bind(this);

        const buttonEl: Element = this.button.el;

        this.button.once('render', () => {
            this.isShown = true;
            this.button.on('change:content', () => this.__adjustPosition(true));
            this.button.on('toggle', () => this.toggle());
            buttonEl.addEventListener('click', this.__handleClick.bind(this));
            buttonEl.addEventListener('blur', this.__onBlur.bind(this));
            buttonEl.addEventListener('touchend', e => e.stopPropagation());
        });

        buttonEl.classList.toggle(classes.CUSTOM_ANCHOR_BUTTON, this.options.customAnchor);
        buttonEl.classList.toggle(classes.DEFAULT_ANCHOR_BUTTON, !this.options.customAnchor);
        if (!this.options.customAnchor && this.options.showDropdownAnchor) {
            this.button.on('render', () => {
                buttonEl.insertAdjacentHTML('beforeend', `<i class="js-default-anchor ${Handlebars.helpers.iconPrefixer(classes.DEFAULT_ANCHOR)} anchor"></i>`);
            });
        }

        this.button.on('destroy', this.__onDestroy, this);

        // dropdown bind on existing DOM element without rendering ButtonView, refactoring needed
        if (options.element) {
            this.button.el = options.element;
            this.button.$el = Backbone.$(options.element);
        }

        return this.button;
    }

    panelEl: Element
    options: optionsType
    maxWidth: number
    __observedEntities: Array<object>

    adjustPosition(isNeedToRefreshAnchorPosition?: boolean): void {
        this.__adjustPosition(isNeedToRefreshAnchorPosition);
    }

    __adjustPosition(isNeedToRefreshAnchorPosition?: boolean): void {
        if (!this.button.isOpen || !this.panelEl) {
            return;
        }
        this.panelEl.style.height = ''; //resetting custom height

        const viewportHeight = window.innerHeight;
        const dropDownRoot = this.button.$el.closest('.js-dropdown__root')[0];
        const isDropDownRootPositionUp = dropDownRoot && dropDownRoot.classList.contains('dropdown__wrp_up');
        const isDropDownRootPositionDown = dropDownRoot && dropDownRoot.classList.contains('dropdown__wrp_down');
        const buttonRect = (dropDownRoot || this.button.el).getBoundingClientRect();
        const bottom = viewportHeight - buttonRect.top - buttonRect.height;

        if (this.maxWidth) {
            this.panelEl.style.maxWidth = `${this.maxWidth}px`;
        }

        const minWidth = Math.max(this.options.panelMinWidth, buttonRect.width);
        this.panelEl.style.minWidth = `${minWidth}px`;

        let offsetHeight = this.panelEl.offsetHeight;

        let position = this.options.panelPosition;

        if (dropDownRoot && isDropDownRootPositionUp) {
            position = panelPosition.UP;
        } else if (dropDownRoot && isDropDownRootPositionDown) {
            position = panelPosition.DOWN;
        } else if (position === panelPosition.DOWN && ((bottom < offsetHeight && buttonRect.top > bottom) || bottom < this.options.minAvailableHeight + offsetHeight)) {
            position = panelPosition.UP;
        } else if (position === panelPosition.UP && buttonRect.top < offsetHeight && bottom > buttonRect.top) {
            position = panelPosition.DOWN;
        }

        const viewport = {
            height: viewportHeight,
            width: window.innerWidth
        };

        const panelRect = this.panelEl.getBoundingClientRect();

        this.panelEl.style.width = `${panelRect.width}px`;

        let left: number;
        let right: number;

        switch (this.options.popoutFlow) {
            case popoutFlow.RIGHT: {
                if (buttonRect.left < WINDOW_BORDER_OFFSET) {
                    left = WINDOW_BORDER_OFFSET;
                } else if (buttonRect.left + panelRect.width > viewport.width - WINDOW_BORDER_OFFSET) {
                    left = viewport.width - WINDOW_BORDER_OFFSET - panelRect.width;
                } else {
                    left = buttonRect.left;
                }

                this.panelEl.style.left = `${left}px`;
                break;
            }
            case popoutFlow.LEFT: {
                const anchorRightCenter = viewport.width - (buttonRect.left + buttonRect.width);

                if (anchorRightCenter < WINDOW_BORDER_OFFSET) {
                    right = WINDOW_BORDER_OFFSET;
                } else if (anchorRightCenter + panelRect.width > viewport.width - WINDOW_BORDER_OFFSET) {
                    right = viewport.width - WINDOW_BORDER_OFFSET - panelRect.width;
                } else {
                    right = anchorRightCenter;
                }

                this.panelEl.style.right = `${right}px`;
                break;
            }
            default:
                break;
        }

        // class adjustments
        if (this.options.popoutFlow === popoutFlow.LEFT) {
            this.panelEl.classList.add(classes.FLOW_LEFT);

            this.panelEl.classList.remove(classes.FLOW_RIGHT);
        } else if (position === panelPosition.UP) {
            this.panelEl.classList.add(classes.FLOW_RIGHT);

            this.panelEl.classList.remove(classes.FLOW_LEFT);
        }

        // class adjustments
        if (position === panelPosition.DOWN) {
            this.button.el.classList.add(classes.DROPDOWN_DOWN);
            this.panelEl.classList.add(classes.DROPDOWN_DOWN);

            this.button.el.classList.remove(classes.DROPDOWN_UP);
            this.panelEl.classList.remove(classes.DROPDOWN_UP);
        } else if (position === panelPosition.UP) {
            this.button.el.classList.add(classes.DROPDOWN_UP);
            this.panelEl.classList.add(classes.DROPDOWN_UP);

            this.button.el.classList.remove(classes.DROPDOWN_DOWN);
            this.panelEl.classList.remove(classes.DROPDOWN_DOWN);
        }

        offsetHeight = this.panelEl.offsetHeight;

        // panel positioning
        let top: number = 0;
        let panelBottom: number = 0;
        let maxHeight: number = 0;
        const indent = this.options.panelOffsetBottom || WINDOW_BORDER_OFFSET;
        switch (position) {
            case panelPosition.UP:
                panelBottom = viewportHeight - buttonRect.bottom + buttonRect.height;
                this.panelEl.style.bottom = `${panelBottom}px`;
                maxHeight = viewportHeight - panelBottom - indent;
                break;
            case panelPosition.DOWN:
                top = buttonRect.top + buttonRect.height;
                this.panelEl.style.top = `${top}px`;
                maxHeight = viewportHeight - top - indent;
                break;
            case panelPosition.RIGHT:
                if ((viewportHeight - buttonRect.bottom < MIN_HEIGHT_TO_OPEN_DOWN) || bottom < this.options.minAvailableHeight + offsetHeight) {
                    top = buttonRect.top + buttonRect.height/2 - offsetHeight;
                } else {
                    top = buttonRect.top + buttonRect.height/2;
                }
                if (top <= WINDOW_BORDER_OFFSET) {
                    top = WINDOW_BORDER_OFFSET; 
                }
                maxHeight = viewportHeight - top - indent;
                this.panelEl.style.top = `${top}px`;
                left = buttonRect.left + buttonRect.width + this.options.panelOffsetLeft;
                this.panelEl.style.left = `${left}px`;
                break;
            default:
                break;
        }

        if (maxHeight !== 0) {
            this.panelEl.style.maxHeight = `${maxHeight}px`;
        }
        if (isNeedToRefreshAnchorPosition) {
            this.__updateAnchorPosition(this.button.el);
        }
    }

    open() {
        if (this.button.isOpen) {
            return;
        }
        this.button.trigger('before:open', this);

        const panelViewOptions = _.extend(this.options.panelViewOptions || {}, {
            parent: this
        });
        this.button.el.classList.add(classes.OPEN);
        this.panelView = new this.options.panelView(panelViewOptions);
        this.button.panelView = this.panelView;
        this.panelView.on('all', (...args) => {
            args[0] = `panel:${args[0]}`;
            this.button.trigger(...args);
        });

        this.panelEl = this.panelView.el;

        this.button.isOpen = true;

        this.panelEl.classList.add('dropdown__wrp');

        this.popupId = WindowService.showTransientPopup(this.panelView, {
            hostEl: this.button.el,
            fadeBackground: this.options.fadeBackground
        });

        this.__adjustPosition();

        this.panelView.on('change:content', () => this.__adjustPosition());
        this.__listenToElementMoveOnce(this.button.el, this.close);

        GlobalEventService.on('window:keydown:captured', (document, event) => this.__keyAction(event));
        GlobalEventService.on('window:mousedown:captured', this.__handleGlobalMousedown.bind(this));
        WindowService.on('popup:close', this.__onWindowServicePopupClose.bind(this));

        const activeElement = document.activeElement;
        if (!this.__isNestedInButton(activeElement) && !this.__isNestedInPanel(activeElement)) {
            //this.panelView.$el.focus(); todo
        } else {
            this.__focus(activeElement);
        }
        this.__suppressHandlingBlur = false;
        this.button.trigger('open', this);
    }

    /**
     * Closes the dropdown panel.
     * @param {...*} arguments Arguments transferred into the <code>'close'</code> event.
     * */
    close(...args) {
        if (!this.button.isOpen || (!document.body.contains(this.button.el) && !document.body.contains(this.panelEl))) {
            return;
        }
        this.button.trigger('before:close', this);

        this.button.el.classList.remove(classes.OPEN);

        GlobalEventService.off('window:keydown:captured', (document, event) => this.__keyAction(event));
        GlobalEventService.off('window:mousedown:captured', this.__handleGlobalMousedown);
        document.removeEventListener('scroll', this.__checkElements);
        GlobalEventService.off('window:mouseup:captured', this.__checkElements);
        GlobalEventService.off('window:keydown:captured', this.__checkElements);

        WindowService.off('popup:close', this.__onWindowServicePopupClose.bind(this));
        this.panelView.off();

        WindowService.closePopup(this.popupId);

        this.__stopListeningToElementMove();

        this.button.$el.focus();
        this.button.isOpen = false;

        this.button.trigger('close', this, ...args);
    }

    toggle(...args) {
        if (this.button.isOpen) {
            this.close(...args);
        } else {
            this.open(...args);
        }
    }

    __keyAction(event) {
        if (event.keyCode === 27) {
            this.close();
        }
    }

    __handleClick(...args) {
        if (this.options.autoOpen) {
            this.toggle();
        }
        this.button.trigger('click', ...args);
    }

    __isNestedInButton(testedEl) {
        return this.button.el === testedEl || this.button.el.contains(testedEl);
    }

    __isNestedInPanel(testedEl) {
        const palet = document.getElementsByClassName('sp-container')[0]; //Color picker custom el container;

        return WindowService.get(this.popupId).some(x => x.el.contains(testedEl) || this.button.el.contains(testedEl) || x.el.parentElement === testedEl)
            || (palet && palet.contains(testedEl));
    }

    __handleBlur() {
        if (
            !this.options.externalBlurHandler(document.activeElement) &&
            !this.__suppressHandlingBlur &&
            !this.__isNestedInButton(document.activeElement) &&
            !this.__isNestedInPanel(document.activeElement)
        ) {
            this.close();
        }
    }

    __handleGlobalMousedown(target) {
        if (this.__isNestedInPanel(target) || this.options.externalBlurHandler(target) || this.__isNestedInFading(target)) {
            this.__suppressHandlingBlur = true;
        } else if (!this.__isNestedInButton(target)) {
            this.close();
        }
    }

    __isNestedInFading(target) {
        const fadingContainer = document.querySelector('.js-fading-panel');
        return fadingContainer.contains(target);
    }

    __onWindowServicePopupClose(popupId) {
        if (this.button.isOpen && this.popupId === popupId) {
            this.close();
        }
    }

    __focus(focusedEl) {
        if (!focusedEl) {
            this.__getFocusableEl().focus();
        } else if (document.activeElement) {
            document.activeElement.addEventListener('blur', this.__onBlur.bind(this));
        }
        this.isFocused = true;
    }

    __onBlur() {
        _.defer(() => {
            this.isFocused = false;
            this.__handleBlur();
        });
        if (document.activeElement) {
            document.activeElement.removeEventListener('blur', this.__onBlur.bind(this));
        }
    }

    __onDestroy() {
        if (this.button.isOpen) {
            WindowService.closePopup(this.popupId);
        }
    }

    __listenToElementMoveOnce(el, callback) {
        if (this.__observedEntities.length === 0) {
            document.addEventListener('scroll', this.__checkElements, true);
            GlobalEventService.on('window:mouseup:captured', this.__checkElements);
            GlobalEventService.on('window:keydown:captured', this.__checkElements);
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
    }

    __stopListeningToElementMove(el = null) {
        if (!el) {
            this.__observedEntities = [];
        } else {
            this.__observedEntities.splice(this.__observedEntities.findIndex(x => x.el === el), 1);
        }
    }

    __checkElements(event) {
        if (!this.__isNestedInButton(event.currentTarget) && !this.__isNestedInPanel(event.currentTarget)) {
            setTimeout(() => {
                if (this.button.isDestroyed()) {
                    return;
                }
                this.__observedEntities.forEach(x => {
                    const { left, top } = x.el.getBoundingClientRect();
                    if (Math.floor(left) !== x.anchorViewportPos.left || Math.floor(top) !== x.anchorViewportPos.top) {
                        x.callback.call(this);
                    }
                });
            }, 50);
        }
    }

    __updateAnchorPosition(el) {
        const observable = this.__observedEntities.find(entrie => entrie.el === el);

        if (observable) {
            const { left, top } = el.getBoundingClientRect();

            observable.anchorViewportPos = {
                left: Math.floor(left),
                top: Math.floor(top)
            };
        }
    }
}
