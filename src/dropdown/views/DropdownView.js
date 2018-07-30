// @flow
import { helpers } from 'utils';
import WindowService from '../../services/WindowService';
import GlobalEventService from '../../services/GlobalEventService';

const THROTTLE_DELAY = 100;

const classes = {
    OPEN: 'open',
    DROPDOWN_DOWN: 'dropdown__wrp_down',
    DROPDOWN_WRP_OVER: 'dropdown__wrp_down-over',
    DROPDOWN_UP: 'dropdown__wrp_up',
    DROPDOWN_UP_OVER: 'dropdown__wrp_up-over',
    VISIBLE_COLLECTION: 'visible-collection'
};

const WINDOW_BORDER_OFFSET = 10;
const MAX_DROPDOWN_PANEL_WIDTH = 200;

const panelPosition = {
    DOWN: 'down',
    UP: 'up'
};

const panelMinWidth = {
    NONE: 'none',
    BUTTON_WIDTH: 'button-width'
};

const defaultOptions = {
    autoOpen: true,
    renderAfterClose: true,
    panelPosition: panelPosition.DOWN,
    panelMinWidth: panelMinWidth.BUTTON_WIDTH,
    allowNestedFocus: true
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
 * @extends Marionette.View
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

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'buttonView');
        helpers.ensureOption(options, 'panelView');

        _.defaults(this.options, _.clone(defaultOptions), options);

        _.bindAll(this, 'open', 'close', '__onBlur');

        this.__observedEntities = [];
        this.__checkElements = _.throttle(this.__checkElements.bind(this), THROTTLE_DELAY);
    },

    template: false,

    className() {
        return `dropdown ${this.options.class || ''}`;
    },

    ui: {
        button: '.js-button-region'
    },

    events: {
        blur: '__onBlur'
    },

    /**
     * Contains an instance of <code>options.buttonView</code> if the dropdown is rendered, <code>null</code> otherwise.
     * */
    buttonView: null,

    /**
     * Contains an instance of <code>options.panelView</code> if the dropdown is open, <code>null</code> otherwise.
     * The view is created every time (!) the panel is triggered to open.
     * */
    panelView: null,

    onRender() {
        if (this.button) {
            this.stopListening(this.button);
        }
        this.button = new this.options.buttonView(_.extend({ parent: this }, this.options.buttonViewOptions));
        this.buttonView = this.button;
        this.listenTo(this.button, 'all', (...args) => {
            args[0] = `button:${args[0]}`;
            this.triggerMethod(...args);
        });
        const el = this.button.render().$el;
        this.$el.append(el);

        this.isShown = true;
        this.button.on('change:content', () => this.panelEl && this.__adjustPosition(this.panelEl));

        el.on('click', this.__handleClick.bind(this));

        this.$el.attr('tabindex', -1);
    },

    onDestroy() {
        if (this.button) {
            this.button.destroy();
        }
        if (this.isOpen) {
            WindowService.closePopup(this.popupId);
        }
    },

    __adjustPosition(panelEl) {
        const viewportHeight = window.innerHeight;
        const buttonEl = this.button.el;
        const buttonRect = buttonEl.getBoundingClientRect();

        const bottom = viewportHeight - buttonRect.top - buttonRect.height;

        const offsetHeight = panelEl.offsetHeight;

        let position = this.options.panelPosition;

        if (position === panelPosition.DOWN && bottom < offsetHeight && buttonRect.top > bottom) {
            position = panelPosition.UP;
        } else if (position === panelPosition.UP && buttonRect.top < offsetHeight && bottom > buttonRect.top) {
            position = panelPosition.DOWN;
        }

        // class adjustments
        this.el.classList.toggle(classes.DROPDOWN_DOWN, position === panelPosition.DOWN);
        this.el.classList.toggle(classes.DROPDOWN_UP, position === panelPosition.UP);
        panelEl.classList.toggle(classes.DROPDOWN_DOWN, position === panelPosition.DOWN);
        panelEl.classList.toggle(classes.DROPDOWN_UP, position === panelPosition.UP);

        // panel positioning
        let top: number = 0;
        switch (position) {
            case panelPosition.UP:
                top = buttonRect.top - offsetHeight;
                break;
            case panelPosition.DOWN:
                top = buttonRect.top + buttonRect.height;
                break;
            default:
                break;
        }

        // trying to fit into viewport
        if (top + offsetHeight > viewportHeight - WINDOW_BORDER_OFFSET) {
            top = viewportHeight - WINDOW_BORDER_OFFSET - offsetHeight;
        }
        if (top <= WINDOW_BORDER_OFFSET) {
            top = WINDOW_BORDER_OFFSET;
        }

        const panelWidth = buttonRect.width > MAX_DROPDOWN_PANEL_WIDTH ? buttonRect.width : MAX_DROPDOWN_PANEL_WIDTH;

        if (this.options.panelMinWidth === panelMinWidth.BUTTON_WIDTH) {
            panelEl.style.width = `${panelWidth}px`;
        }

        if (panelEl.clientWidth < MAX_DROPDOWN_PANEL_WIDTH) {
            panelEl.style.minWidth = `${panelWidth}px`;
        }

        panelEl.style.top = `${top}px`;
        panelEl.style.left = `${buttonRect.left}px`;
    },

    /**
     * Opens the dropdown panel.
     * */
    open() {
        if (this.isOpen) {
            return;
        }
        this.trigger('before:open', this);

        const panelViewOptions = _.extend(this.options.panelViewOptions || {}, {
            parent: this
        });
        this.el.classList.add(classes.OPEN);
        this.panelView = new this.options.panelView(panelViewOptions);
        this.panelView.on('all', (...args) => {
            args[0] = `panel:${args[0]}`;
            this.triggerMethod(...args);
        });

        this.popupId = WindowService.showTransientPopup(this.panelView, {
            hostEl: this.el
        });
        this.panelEl = this.panelView.el;

        this.__adjustPosition(this.panelEl);
        //const buttonWidth = this.button.el.getBoundingClientRect().width;

        //this.panelView.el.getElementsByClassName(classes.VISIBLE_COLLECTION)[0].style.width = `${panelWidth}`;

        this.listenTo(this.panelView, 'change:content', () => this.panelEl && this.__adjustPosition(this.panelEl));
        this.__listenToElementMoveOnce(this.el, this.close);
        this.listenTo(GlobalEventService, 'window:keydown:captured', (document, event) => this.__keyAction(event));
        this.listenTo(GlobalEventService, 'window:mousedown:captured', this.__handleGlobalMousedown);
        this.listenTo(WindowService, 'popup:close', this.__onWindowServicePopupClose);

        const activeElement = document.activeElement;
        if (!this.__isNestedInButton(activeElement) && !this.__isNestedInPanel(activeElement)) {
            //this.panelView.$el.focus(); todo
        } else {
            this.__focus(activeElement);
        }
        this.__suppressHandlingBlur = false;
        this.isOpen = true;
        this.trigger('open', this);
    },

    /**
     * Closes the dropdown panel.
     * @param {...*} arguments Arguments transferred into the <code>'close'</code> event.
     * */
    close(...args) {
        if (!this.isOpen || !document.body.contains(this.el)) {
            return;
        }
        this.trigger('before:close', this);

        this.el.classList.remove(classes.OPEN);

        WindowService.closePopup(this.popupId);

        this.__stopListeningToElementMove();
        this.stopListening(GlobalEventService);
        this.stopListening(WindowService);
        this.stopListening(this.panelView);
        this.button.$el.focus();
        this.isOpen = false;

        this.trigger('close', this, ...args);
        if (this.options.renderAfterClose && !this.isDestroyed) {
            this.button.render();
        }
    },

    __keyAction(event) {
        if (event.keyCode === 27) {
            this.close();
        }
    },

    __handleClick() {
        if (this.options.autoOpen) {
            this.open();
        }
    },

    __isNestedInButton(testedEl) {
        return this.el === testedEl || this.el.contains(testedEl);
    },

    __isNestedInPanel(testedEl) {
        const palet = document.getElementsByClassName('sp-container')[0]; //Color picker custom el container;

        return WindowService.get(this.popupId).some(x => x.el.contains(testedEl) || this.el.contains(testedEl)) || (palet && palet.contains(testedEl));
    },

    __handleBlur() {
        if (!this.__suppressHandlingBlur && !this.__isNestedInButton(document.activeElement) && !this.__isNestedInPanel(document.activeElement)) {
            this.close();
        }
    },

    __handleGlobalMousedown(target) {
        if (this.__isNestedInPanel(target)) {
            this.__suppressHandlingBlur = true;
        } else if (!this.__isNestedInButton(target)) {
            this.close();
        }
    },

    __onWindowServicePopupClose(popupId) {
        if (this.isOpen && this.popupId === popupId) {
            this.close();
        }
    },

    __focus(focusedEl) {
        if (!focusedEl) {
            this.__getFocusableEl().focus();
        } else if (document.activeElement) {
            document.activeElement.addEventListener('blur', this.__onBlur);
        }
        this.isFocused = true;
    },

    __onBlur() {
        _.defer(() => {
            this.isFocused = false;
            this.__handleBlur();
        });
        if (document.activeElement) {
            document.activeElement.removeEventListener('blur', this.__onBlur);
        }
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
            if (this.isDestroyed()) {
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
});
