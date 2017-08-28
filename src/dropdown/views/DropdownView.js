/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { $, Handlebars } from 'lib';
import { helpers } from 'utils';
import WindowService from '../../services/WindowService';
import template from '../templates/dropdown.hbs';
import BlurableBehavior from '../utils/BlurableBehavior';
import GlobalEventService from '../../services/GlobalEventService';
import ListenToElementMoveBehavior from '../utils/ListenToElementMoveBehavior';
import WrapperView from './WrapperView';

const classes = {
    OPEN: 'open',
    DROPDOWN_DOWN: 'dropdown__wrp_down',
    DROPDOWN_WRP_OVER: 'dropdown__wrp_down-over',
    DROPDOWN_UP: 'dropdown__wrp_up',
    DROPDOWN_UP_OVER: 'dropdown__wrp_up-over'
};

const WINDOW_BORDER_OFFSET = 10;

const panelPosition = {
    DOWN: 'down',
    DOWN_OVER: 'down-over',
    UP: 'up',
    UP_OVER: 'up-over'
};

const panelMinWidth = {
    NONE: 'none',
    BUTTON_WIDTH: 'button-width'
};

const defaultOptions = {
    autoOpen: true,
    renderAfterClose: true,
    panelPosition: panelPosition.DOWN,
    panelMinWidth: panelMinWidth.BUTTON_WIDTH
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
 * @extends Marionette.LayoutView
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

export default Marionette.LayoutView.extend(/** @lends module:core.dropdown.views.DropdownView.prototype */ {
    initialize(options) {
        _.extend(this.options, _.clone(defaultOptions), options || {});
        helpers.ensureOption(options, 'buttonView');
        helpers.ensureOption(options, 'panelView');
        _.bindAll(this, 'open', 'close');

        this.listenTo(WindowService, 'popup:close', this.__onWindowServicePopupClose);
    },

    template: Handlebars.compile(template),

    className: 'dropdown',

    regions: {
        buttonRegion: '.js-button-region'
    },

    ui: {
        button: '.js-button-region'
    },

    events: {
        'click @ui.button': '__handleClick'
    },

    behaviors: {
        BlurableBehavior: {
            behaviorClass: BlurableBehavior,
            onBlur: '__handleBlur'
        },
        ListenToElementMoveBehavior: {
            behaviorClass: ListenToElementMoveBehavior
        }
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
        this.button = new this.options.buttonView(_.extend({ parent: this }, _.result(this.options, 'buttonViewOptions')));
        this.buttonView = this.button;
        this.listenTo(this.button, 'all', (...args) => {
            args[0] = `button:${args[0]}`;
            this.triggerMethod(...args);
        });

        if (this.isShown) {
            this.buttonRegion.show(this.button);
        }
    },

    onShow() {
        this.buttonRegion.show(this.button);
        this.isShown = true;
    },

    onDestroy() {
        if (this.isOpen) {
            WindowService.closePopup(this.popupId);
        }
    },

    __adjustPosition($panelEl) {
        const viewportHeight = window.innerHeight;
        const $buttonEl = this.buttonRegion.$el;
        const buttonRect = $buttonEl.offset();
        buttonRect.height = $buttonEl.outerHeight();
        buttonRect.width = $buttonEl.outerWidth();
        buttonRect.bottom = viewportHeight - buttonRect.top - buttonRect.height;
        const panelRect = $panelEl.offset();
        panelRect.height = $panelEl.outerHeight();

        let position = this.options.panelPosition;

        // switching position if there is not enough space
        switch (position) {
            case panelPosition.DOWN:
                if (buttonRect.bottom < panelRect.height && buttonRect.top > buttonRect.bottom) {
                    position = panelPosition.UP;
                }
                break;
            case panelPosition.DOWN_OVER:
                if (buttonRect.bottom + buttonRect.height < panelRect.height && buttonRect.top > buttonRect.bottom) {
                    position = panelPosition.UP_OVER;
                }
                break;
            case panelPosition.UP:
                if (buttonRect.top < panelRect.height && buttonRect.bottom > buttonRect.top) {
                    position = panelPosition.UP;
                }
                break;
            case panelPosition.UP_OVER:
                if (buttonRect.top + buttonRect.height < panelRect.height && buttonRect.bottom > buttonRect.top) {
                    position = panelPosition.UP;
                }
                break;
            default:
                break;
        }

        // class adjustments
        $panelEl.toggleClass(classes.DROPDOWN_DOWN, position === panelPosition.DOWN);
        $panelEl.toggleClass(classes.DROPDOWN_WRP_OVER, position === panelPosition.DOWN_OVER);
        $panelEl.toggleClass(classes.DROPDOWN_UP, position === panelPosition.UP);
        $panelEl.toggleClass(classes.DROPDOWN_UP_OVER, position === panelPosition.UP_OVER);

        // panel positioning
        let top;
        switch (position) {
            case panelPosition.UP:
                top = buttonRect.top - panelRect.height;
                break;
            case panelPosition.UP_OVER:
                top = buttonRect.top + buttonRect.height - panelRect.height;
                break;
            case panelPosition.DOWN:
                top = buttonRect.top + buttonRect.height;
                break;
            case panelPosition.DOWN_OVER:
                top = buttonRect.top;
                break;
            default:
                break;
        }

        // trying to fit into viewport
        if (top + panelRect.height > viewportHeight - WINDOW_BORDER_OFFSET) {
            top = viewportHeight - WINDOW_BORDER_OFFSET - panelRect.height;
        }
        if (top <= WINDOW_BORDER_OFFSET) {
            top = WINDOW_BORDER_OFFSET;
        }

        const panelCss = {
            top,
            left: buttonRect.left
        };
        if (this.options.panelMinWidth === panelMinWidth.BUTTON_WIDTH) {
            panelCss['min-width'] = buttonRect.width;
        }
        $panelEl.css(panelCss);
    },

    /**
     * Opens the dropdown panel.
     * */
    open() {
        if (this.isOpen) {
            return;
        }
        this.trigger('before:open', this);

        const panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
            parent: this
        });
        this.$el.addClass(classes.OPEN);
        this.panelView = new this.options.panelView(panelViewOptions);
        this.panelView.on('all', (...args) => {
            args[0] = `panel:${args[0]}`;
            this.triggerMethod(...args);
        });

        const wrapperView = new WrapperView({
            view: this.panelView,
            className: 'dropdown__wrp'
        });
        this.popupId = WindowService.showTransientPopup(wrapperView, {
            hostEl: this.el
        });
        this.__adjustPosition(wrapperView.$el);

        this.listenToElementMoveOnce(this.el, this.close);
        this.listenTo(GlobalEventService, 'window:mousedown:captured', this.__handleGlobalMousedown);

        const activeElement = document.activeElement;
        if (!this.__isNestedInButton(activeElement) && !this.__isNestedInPanel(activeElement)) {
            this.panelView.$el.focus();
        } else {
            this.focus(activeElement);
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
        if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
            return;
        }
        this.trigger('before:close', this);

        this.$el.removeClass(classes.OPEN);

        WindowService.closePopup(this.popupId);

        this.stopListeningToElementMove();
        this.stopListening(GlobalEventService);
        this.button.$el.focus();
        this.isOpen = false;

        this.trigger('close', this, ...args);
        if (this.options.renderAfterClose) {
            this.button.render();
        }
    },

    __handleClick() {
        if (this.options.autoOpen) {
            this.open();
        }
    },

    __isNestedInButton(testedEl) {
        return this.el === testedEl || $.contains(this.el, testedEl);
    },

    __isNestedInPanel(testedEl) {
        return WindowService.get(this.popupId).map(x => x.el).some(el => el === testedEl || $.contains(el, testedEl));
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
    }
});
